import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';

const BASE_DIR = `${RNFS.DocumentDirectoryPath}/media`;

export async function ensureMediaDirs() {
    const audioDir = `${BASE_DIR}/audio`;
    const imageDir = `${BASE_DIR}/images`;

    if (!(await RNFS.exists(audioDir))) await RNFS.mkdir(audioDir);
    if (!(await RNFS.exists(imageDir))) await RNFS.mkdir(imageDir);
}

export async function persistMedia(
    uri: string,
    type: 'audio' | 'image',
) {
    await ensureMediaDirs();

    const ext = uri.split('.').pop() || 'jpg';
    const filename = `${uuid.v4()}.${ext}`;

    const target =
        type === 'audio'
            ? `${BASE_DIR}/audio/${filename}`
            : `${BASE_DIR}/images/${filename}`;

    try {
        if (uri.startsWith('content://')) {
            // 🔑 ANDROID SAFE PATH
            const base64 = await RNFS.readFile(uri, 'base64');
            await RNFS.writeFile(target, base64, 'base64');
        } else {
            const cleanUri = uri.replace('file://', '');
            await RNFS.copyFile(cleanUri, target);
        }

        return target;
    } catch (e) {
        console.error('persistMedia failed', e);
        return undefined;
    }
}
