import { BlobServiceClient } from "@azure/storage-blob";


$(document).ready(function () {
  const inputFile = $("#picture__input");
  const pictureImage = $(".picture__image");
  const pictureImageTxt = "Anexar uma arquivo";
  $(pictureImage).attr("innerHTML", pictureImageTxt);

  inputFile.on("change", function (e) {
    const inputTarget = e.target;
    const file = inputTarget.files[0];

    if (file) {
      const reader = new FileReader();

      $(reader).on("load", function (event) {
        const readerTarget = event.target;

        const img = $("<img></img>");
        $(img).attr("src", readerTarget.result);
        img.addClass("picture__img");

        $(pictureImage).html("");
        $(pictureImage).append(img);
      });

      reader.readAsDataURL(file);
    } else {
      $(pictureImage).attr("innerHTML", pictureImageTxt);
    }

    $(".btn-send-file").on("click", sendArchive);
  });
});

async function sendArchive() {
  try {
    const request = await fetch(
      `${import.meta.env.VITE_ORIGIN}${import.meta.env.VITE_GENERATE_SAS_TOKEN_ROUTE}`,
      {
        method: 'GET',
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      });
    const response = await request.json()
    const url = new URL(response.sasUrl)
    const [containerName, filename] = url.pathname.split('/').slice(1)

    // Create a new BlobServiceClient
    const blobServiceClient = new BlobServiceClient(
      `${url.origin}${url.search}`
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlockBlobClient(filename);

    /**
     * @type {File}
     */
    const archive = $("#picture__input")[0].files[0];

    await blobClient.uploadBrowserData(archive, {
      onProgress: (progress) => {
        calculateProgress(progress, archive.size, filename);
      },
      blobHTTPHeaders: {
        blobContentType: archive.type,
      },
    });
  } catch (error) {
    console.log(error);
  }
}


function calculateProgress(progress, sizeFile, filename) {
  const progressMultiplicated = progress.loadedBytes * 100;
  const valueProgress = progressMultiplicated / sizeFile;

  showProgress(valueProgress, filename);
}

function showProgress(valueProgress, filename) {
  const progressElement = $("#file-progress");

  $(progressElement).attr("hidden", false);
  $(progressElement).attr("value", valueProgress);

  if (valueProgress == 100) {
    progressConcluited(filename);
  }
}


function progressConcluited(filename) {
  const progressElement = $("#file-progress");
  const uploadConcluited = $(".concluited-upload");

  $(progressElement).attr("hidden", true);
  $(uploadConcluited).attr("hidden", false);

  confirmUpload(filename);
}

function confirmUpload(filename) {
  console.log('Here')

  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `${import.meta.env.VITE_ORIGIN}${import.meta.env.VITE_CONFIRM_UPLOAD_ROUTE}`,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "processData": false,
    "data": JSON.stringify({ "filename": `${filename}` })
  };

  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}