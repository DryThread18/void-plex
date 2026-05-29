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

    const parsedUrl = new URL(url);

    const pathOnly = parsedUrl.pathname;

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

        const text = await response.text();

        results.push({
          payload,
          status: response.status,
          contentType: response.headers.get("content-type"),
          preview: text
        });
      } catch (err) {
        results.push({
          payload,
          error: err.message
        });
      }
    }

    console.log("========== SCAN ==========");
    console.log("Folder URL:", url);
    console.log(JSON.stringify(results, null, 2));
    console.log("==========================");

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

app.post("/test-file", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing URL"
      });
    }

    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0"
      }
    });

    const text = await response.text();

    res.json({
      success: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      finalUrl: response.url,
      preview: text
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post("/resolve-movie", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing URL"
      });
    }

    const parsedUrl = new URL(url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0"
      },
      body: JSON.stringify({
        path: parsedUrl.pathname
      })
    });

    const text = await response.text();

    console.log("========== RESOLVE ==========");
    console.log("Input URL:", url);
    console.log("Path:", parsedUrl.pathname);
    console.log("Status:", response.status);
    console.log("Response:");
    console.log(text);
    console.log("=============================");

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Response was not valid JSON",
        preview: text.slice(0, 1000)
      });
    }

    const ddl =
      data.link
        ? `${parsedUrl.origin}${data.link}`
        : null;

    res.json({
      success: true,
      name: data.name,
      size: data.size,
      thumbnailLink: data.thumbnailLink,
      fileExtension: data.fileExtension,
      mimeType: data.mimeType,
      ddl
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    "VOID PLEX API running on port",
    PORT
  );
});
