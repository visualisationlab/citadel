
import QRcode from 'qrcode'

export module QR {
    let qrFun: null | React.Dispatch<React.SetStateAction<string>>

    export function registerFun(fun: React.Dispatch<React.SetStateAction<string>>) {
        qrFun = fun
    }

    export function genQR(URL: string, port: string, sid: string, headsetKey: string, userID: string) {
        if (qrFun) {
            console.log(`ws://${URL}:${port}?sid=${sid}&headsetKey=${headsetKey}&userID=${userID}`)
            QRcode.toDataURL(`ws://${URL}:${port}?sid=${sid}&headsetKey=${headsetKey}&userID=${userID}`,
                {
                    margin: 0,
                    width: 800,
                    version: 5,
                    errorCorrectionLevel: 'L'
                }, (err, url) => {
                    if (qrFun)
                        qrFun(url)
            })
        }
    }

    export function genRickRoll() {
        if (qrFun) {
            QRcode.toDataURL(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
                {
                    margin: 0,
                    version: 5,

                }, (err, url) => {
                    if (qrFun)
                        qrFun(url)
            })
        }
    }

    export function clearQR() {
        if (qrFun)
            qrFun('')
    }
}
