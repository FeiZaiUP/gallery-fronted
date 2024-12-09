import axios from 'axios';

export const fetchImages = async (accessToken) => {
    const response = await axios.get('/images/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.data;
};

export const uploadImage = async (formData, accessToken, onUploadProgress) => {
    const response = await axios.post('/images/upload/', formData, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
    return response.data;
};

export const bulkDeleteImages = async (imageIds, accessToken) => {
    await axios.post('/images/bulk_delete/', { image_ids: imageIds }, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
};

