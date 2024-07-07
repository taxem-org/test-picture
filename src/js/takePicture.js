import { Camera, CameraResultType } from '@capacitor/camera'

const btn = document.querySelector('.pic-btn')

const takePicture = async () => {
    const image = await Camera.getPhoto({
        quality: 100,
        saveToGallery: true,
        format: 'jpeg',
        promptLabelHeader: 'Adicionar foto',
        presentationStyle: 'fullscreen',
        promptLabelPicture: 'Tirar foto',
        promptLabelPhoto: 'Escolher da galeria',
        promptLabelCancel: 'Cancelar',
        resultType: CameraResultType.Uri
    })

    const exif = image.exif || null

    handleUpload(image)

    async function handleUpload(image) {
        let lat, lng, fov
        // Check if image has EXIF location data
        // Supposedly from gallery
        if (image.exif && ((image.exif.GPSLatitude && image.exif.GPSLongitude) || image.exif.GPS)) {
            let lat = image.exif.GPSLatitude ? image.exif.GPSLatitude : image.exif.GPS.Latitude
            let lng = image.exif.GPSLongitude ? image.exif.GPSLongitude : image.exif.GPS.Longitude
            lat = image.exif.GPS.LatitudeRef === 'S' || image.exif.GPSLatitudeRef === 'S' ? -lat : lat
            lng =
                image.exif.GPS.LongitudeRef === 'W' || image.exif.GPSLongitudeRef === 'W' ? -lng : lng
            coords = { lat, lng }
            await uploadFileAndLocation(image)
        }

        async function uploadFileAndLocation(image, lat, lng, fov = null, direction = null) {
            const formData = new FormData()
            formData.append('file', await srcToFile(image.webPath, 'image.jpg', 'image/jpeg'))

            let url = 'https://example.com//photos'

            if (lat && lng) {
                url += `?lat=${lat}&lng=${lng}`
                if (fov && direction) {
                    url += `&fov=${fov}&direction=${direction}`
                }
            }

            sendFile(formData, url)
        }

        function sendFile(data, url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', url, true)

                xhr.upload.onprogress = function (event) {
                    if (event.lengthComputable && event.loaded <= event.total) {
                        $uploadPercent = parseInt((event.loaded / event.total) * 100)
                        console.log(`Upload progress: ${$uploadPercent}%`)
                    }
                }

                xhr.onload = function () {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.response))
                    } else {
                        reject(new Error(`Request failed with status ${this.status}`))
                    }
                }

                xhr.onerror = function () {
                    reject(new Error('Network error'))
                }

                xhr.send(data)
            })
        }

        function srcToFile(src, fileName, mimeType) {
            return fetch(src)
                .then((res) => res.arrayBuffer())
                .then((buf) => new File([buf], fileName, { type: mimeType }))
        }
    }
}

btn.addEventListener('click', takePicture)
