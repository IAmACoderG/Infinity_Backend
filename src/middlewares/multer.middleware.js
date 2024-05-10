import multer from "multer";

//unique filenames storeing method

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/temp')
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
// })

// export const upload = multer({ storage: storage })

//easy approach...>>> learn upper approach
//store always data with originalfile name

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage })
