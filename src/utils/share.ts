import { ResumeData } from "../types";

export const generateShareableLink = (data : ResumeData) => {
    try {
        // encoding the data so that it can be easily load on the other client side
        const compressData = btoa(JSON.stringify(data))
        const baseURL = 'https://github-resume-gen.netlify.app'
        return `${baseURL}?resume=${compressData}`
    } catch (error) {
        console.error('Error generating shareable link : ', error)
        return null;
    }
}

export const getDataFromShare = () => {
    try {
        const urlParams = new URLSearchParams(window.location.search)
        const sharedData = urlParams.get('resume');

        if (!sharedData) return null;
        const decodeData = JSON.parse(atob(sharedData));
        return decodeData;
    } catch (error) {
        console.error("Error reading shared data : ", error)
        return null
    }
}