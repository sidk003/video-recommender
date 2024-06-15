import boto3
import json
import pandas as pd
import pickle

BUCKET_NAME = 'video-recommender'
DATASET_FILE_KEY = 'dataset/model_Input.csv'
PKL_FILE_PATH = 'dataset/similarity_score.pkl'


def load_files():
    s3 = boto3.resource('s3', region_name='us-east-2')
    dataset_s3_object = s3.Bucket(BUCKET_NAME).Object(DATASET_FILE_KEY).get()
    dataset = pd.read_csv(dataset_s3_object['Body'])

    with open('/tmp/similarity_score.pkl', 'wb') as data:
        s3.Bucket(BUCKET_NAME).download_fileobj(PKL_FILE_PATH, data)

    with open('/tmp/similarity_score.pkl', 'rb') as data:
        similarity_score = pickle.load(data)
    return dataset, similarity_score


def recommend_video(event, context):
    video_id = event['video_id']
    df1, similarity_score = load_files()
    try:
        video_index = df1[df1['video_id'] == video_id].index[0]
        distances = similarity_score[video_index]
        videos_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:11]

        # Calculate the composite score
        recommendations = []
        for i in videos_list:
            idx = i[0]
            cosine_sim = i[1]

            # Retrieve the popularity metrics for the video
            video_view_count = df1.iloc[idx].video_view_count
            like_count = df1.iloc[idx].like_count
            subscriber_count = df1.iloc[idx].subscriber_count

            # Create a composite score (adjust weights as needed)
            composite_score = 0.55 * cosine_sim + 0.25 * video_view_count + 0.05 * like_count + 0.15 * subscriber_count
            recommendations.append((idx, composite_score))

        # Sort recommendations based on the composite score
        recommendations = sorted(recommendations, key=lambda x: x[1], reverse=True)[:5]

        # Prepare the response
        response = []
        for idx, score in recommendations:
            video_info = {
                'video_id': df1.iloc[idx].video_id,
                'title': df1.iloc[idx].title,
                'channel_title': df1.iloc[idx].channel_title,
                'composite_score': score
            }
            response.append(video_info)

        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }

    except Exception as e:
        print('exception: {}', e)
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Video ID not found'})
        }
