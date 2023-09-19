
// import QRcode from 'qrcode'

// export module QR {
//     let qrFun: null | React.Dispatch<React.SetStateAction<string>>

//     export function registerFun(fun: React.Dispatch<React.SetStateAction<string>>) {
//         qrFun = fun
//     }

//     export function genQR(URL: string, port: string, sid: string, headsetKey: string, userID: string) {
//         if (qrFun) {
//             console.log(`wss://${URL}:${port}?sid=${sid}&headsetKey=${headsetKey}&userID=${userID}`)
//             QRcode.toDataURL(`wss://${URL}:${port}?sid=${sid}&headsetKey=${headsetKey}&userID=${userID}`,
//                 {
//                     margin: 0,
//                     width: 800,
//                     version: 5,
//                     errorCorrectionLevel: 'L'
//                 }, (err, url) => {
//                     if (qrFun)
//                         qrFun(url)
//             })
//         }
//     }

//     export function clearQR() {
//         if (qrFun)
//             qrFun('')
//     }
// }
