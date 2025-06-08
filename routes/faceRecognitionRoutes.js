// // routes/faceRecognitionRoutes.js
// const express = require("express");

// const router = express.Router();
// const axios = require("axios");
// // const FormData = require("form-data");

// router.post("/recognize", async (req, res) => {
//   try {
//     const response = await axios.post(
//       "http://192.168.1.10:5000/recognize",
//       req.body,
//       {
//         headers: {
//           ...req.headers,
//           "content-type": "multipart/form-data"
//         }
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: "Face recognition service failed" });
//   }
// });

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const FormData = require("form-data");

// router.post("/recognize", async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image provided" });
//     }

//     const formData = new FormData();
//     formData.append("image", req.file.buffer, {
//       filename: "capture.jpg",
//       contentType: req.file.mimetype
//     });

//     const response = await axios.post(
//       "http://192.168.1.10:5000/recognize",
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders()
//         }
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error("Face recognition error:", error);
//     res.status(500).json({ error: "Face recognition service failed" });
//   }
// });

// module.exports = router;
const express = require("express");

const router = express.Router();
const axios = require("axios");
const FormData = require("form-data");

router.post("/recognize", async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: "capture.jpg",
      contentType: req.file.mimetype
    });
    if (req.body.employeeId) {
      formData.append("employeeId", req.body.employeeId); // Forward employeeId
    }

    const response = await axios.post(
      "http://192.168.1.10:5000/recognize",
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    // console.error("Face recognition error:", error);
    res.status(500).json({ error: "Face recognition service failed" });
  }
});

module.exports = router;
