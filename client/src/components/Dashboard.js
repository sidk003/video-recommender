import {React, useCallback, useEffect, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {IconButton, InputBase, Paper} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import axios from "axios";
import {BASE_URL} from "../Constants";

export const Dashboard = () => {
    const theme = createTheme({palette: {mode: "dark"}});
    const [videoId, setVideoId] = useState();
    const [data, setData] = useState([]);
    const [error, setError] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback((event) => {
        setVideoId(event.target.value);
    }, []);

    const getUrl = useCallback((baseUrl, param) => {
        const url = new URL(baseUrl);
        url.searchParams.append('video_id', param);
        return url.toString();
    }, []);

    useEffect(() => {
        if (videoId) {
            setIsLoading(true);
            setError(undefined);
            axios.get(getUrl(BASE_URL, videoId)).then((response) => {
                setData(response.data);
                setIsLoading(false);
                console.log('data: ', response);
            }).catch((error) => {
                setIsLoading(false);
                setError(error.response.data.message);
                console.log('error: ', error);
            });
        }
    }, [videoId]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Paper
                component="form"
                sx={{margin: 'auto', display: 'flex', alignItems: 'center', width: 400, marginTop: '20px'}}
            >
                <InputBase
                    sx={{ml: 1, flex: 1}}
                    placeholder="Video ID"
                    inputProps={{'aria-label': 'Video ID'}}
                    onBlur={handleSubmit}
                />
                <IconButton type="button" sx={{p: '10px'}} aria-label="search">
                    <SearchIcon/>
                </IconButton>
            </Paper>
            {error ? <Typography component="div" key='h3' variant='h5'>{error}</Typography> :
                <Grid container wrap="nowrap" sx={{paddingLeft: 25, width: '100%'}}>
                    {(isLoading ? Array.from(new Array(5)) : data ? data : []).map((item, index) => (
                        <Box key={index} sx={{width: 220, marginRight: 1, my: 5}}>
                            {item ? (
                                <a href={`https://www.youtube.com/embed/${item.video_id}`}>
                                    <img
                                        style={{width: 200, height: 120}}
                                        alt={item.title}
                                        src={`https://img.youtube.com/vi/${item.video_id}/maxresdefault.jpg`}
                                    />
                                </a>
                            ) : (
                                <Skeleton variant="rectangular" width={210} height={118}/>
                            )}

                            {item ? (
                                <Box sx={{pr: 2}}>
                                    <Typography gutterBottom variant="body2">
                                        {item.title}
                                    </Typography>
                                    <Typography display="block" variant="caption" color="text.secondary">
                                        {item.channel_title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.composite_score}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{pt: 0.5}}>
                                    <Skeleton/>
                                    <Skeleton width="60%"/>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Grid>}
        </ThemeProvider>
    );
};