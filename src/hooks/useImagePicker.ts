import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export function useImagePicker() {
    async function takePhoto() {
        const res = await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
            cameraType: 'back',
        });

        return res.assets?.[0];
    }

    async function pickFromGallery() {
        const res = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        return res.assets?.[0];
    }

    return { takePhoto, pickFromGallery };
}
