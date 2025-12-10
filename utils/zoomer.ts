import type {Coordinates} from "vue-advanced-cropper";
import type {ZoomerImageData, ZoomerInternalImage} from "~/types/zoomerModels";

function fix(n: number) {
    return Math.abs(n) < 1e-10 ? 0.0 : n
}

export function constructImageData(img64: string, author: string, width: number, height: number): ZoomerImageData {
    return {
        img64: img64,
        author: author,
        width: width,
        height: height,
        stepWidths: [],
        stepHeights: [],
        stepLefts: [],
        stepTops: [],
        stepTranslateXs: [],
        stepTranslateYs: [],
        stepScaleXs: [],
        stepScaleYs: []
    }
}

export function addImageDataStep(imgData: ZoomerImageData, coordinates: Coordinates, img: ZoomerInternalImage): ZoomerImageData {
    imgData.width = img.width;
    imgData.height = img.height;
    imgData.stepWidths.push(coordinates.width);
    imgData.stepHeights.push(coordinates.height);
    imgData.stepLefts.push(coordinates.left);
    imgData.stepTops.push(coordinates.top);
    imgData.stepTranslateXs.push(fix(img.transforms.translateX))
    imgData.stepTranslateYs.push(fix(img.transforms.translateY))
    imgData.stepScaleXs.push(fix(img.transforms.scaleX))
    imgData.stepScaleYs.push(fix(img.transforms.scaleY))
    return imgData
}

export function translateDataStep(step: number, data: ZoomerImageData): any {
    const i = step - 1

    return {
        coordinates: {
            height: data.stepHeights[i],
            left: data.stepLefts[i],
            top: data.stepTops[i],
            width: data.stepWidths[i]
        },
        image: {
            height: data.height,
            width: data.width,
            src: data.img64 ?? `/zoomer/${data.imgName}.webp`,
            transforms: {
                flip: {
                    horizontal: false,
                    vertical: false,
                },
                rotate: 0,
                scaleX: data.stepScaleXs[i],
                scaleY: data.stepScaleYs[i],
                translateX: data.stepTranslateXs[i],
                translateY: data.stepTranslateYs[i],
            }
        }
    }
}