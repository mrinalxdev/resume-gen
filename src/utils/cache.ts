export const saveToCache = (data : any) => {
    try {
        const dataWithTimeStamp = {
            data, 
            timestamp : new Date().getTime()
        };
        localStorage.setItem('resumeData', JSON.stringify(dataWithTimeStamp));

    } catch (error) {
        console.error("Error saving to cache : ", error);
    }
}

export const getFromCache = () => {
    try {
        const cached = localStorage.getItem('resumeData');
        if (!cached) return null;

        const {data, timestamp} = JSON.parse(cached);
        const now = new Date().getTime();
        const tenMinutes = 10 * 60 * 1000;

        if (now - timestamp > tenMinutes) {
            localStorage.removeItem('resumeData');
            return null;
        }
        return data;
    }catch (error){
        console.error("Error reading from cache : ", error)
        return null
    }
}