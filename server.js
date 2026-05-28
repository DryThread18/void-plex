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

    // EXTRACT PATH ONLY

    const parsedUrl = new URL(url);

    const pathOnly =
      parsedUrl.pathname;

    // TEST MULTIPLE VARIATIONS

    const testPayloads = [

      {
        path: pathOnly,
        page_token: "",
        page_index: 0
      },

      {
        path: decodeURIComponent(pathOnly),
        page_token: "",
        page_index: 0
      },

      {
        path: pathOnly.replace(/\/$/, ""),
        page_token: "",
        page_index: 0
      }

    ];

    const results = [];

    for (const payload of testPayloads) {

      try {

        const response = await fetch(url, {

          method: "POST",

          headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0"
          },

          body: JSON.stringify(payload)

        });

        const text =
          await response.text();

        results.push({

          payload,

          status: response.status,

          contentType:
            response.headers.get(
              "content-type"
            ),

          preview:
            text.slice(0, 1000)

        });

      } catch (err) {

        results.push({

          payload,

          error: err.message

        });

      }

    }

    res.json({

      success: true,

      tested: results.length,

      results

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
