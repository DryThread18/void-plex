import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {

  res.json({
    success: true,
    name: "VOID PLEX API"
  });

});

app.post("/scan", async (req, res) => {

  try {

    const { url } = req.body;

    if (!url) {

      return res.status(400).json({
        success: false,
        error: "Missing URL"
      });

    }

    const response = await fetch(url, {

      method: "POST",

      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0"
      },

      body: JSON.stringify({
        page_token: "",
        page_index: 0
      })

    });

    const text = await response.text();

    let parsed;

    try {

      parsed = JSON.parse(text);

    } catch {

      parsed = null;

    }

    res.json({

      success: true,

      debug: {
        status: response.status,
        contentType:
          response.headers.get("content-type")
      },

      parsed,

      preview: text.slice(0, 5000)

    });

  } catch (err) {

    res.status(500).json({

      success: false,
      error: err.message

    });

  }

});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "VOID PLEX API running on port",
    PORT
  );

});
