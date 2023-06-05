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

    $(".btn-send-file").on("click", async function sendArchive() {
      try {
        const url = "http://localhost:3000/api/upload/generate-sas-token";
        const request = await fetch(url);
        const response = await request.json();

        // Create a new BlobServiceClient
        const blobServiceClient = new BlobServiceClient(
          `${response.account}?${response.sas}`
        );

        const containerClient = blobServiceClient.getContainerClient(
          response.container
        );

        const blobClient = containerClient.getBlockBlobClient(
          response.filename
        );

        function showProgress(valueProgress) {
          const progressElement = $("#file-progress");

          $(progressElement).attr("hidden", false);
          $(progressElement).attr("value", valueProgress);

          if (valueProgress == 100) {
            progressConcluited();
          }
        }

        function calculateProgress(progress, sizeFile) {
          const progressMultiplicated = progress.loadedBytes * 100;
          const valueProgress = progressMultiplicated / sizeFile;

          showProgress(valueProgress);
        }

        /**
         * @type {File}
         */
        const archive = $("#picture__input")[0].files[0];

        await blobClient.uploadBrowserData(archive, {
          onProgress: (progress) => {
            calculateProgress(progress, archive.size);
          },
          blobHTTPHeaders: {
            blobContentType: archive.type,
          },
        });

        function progressConcluited() {
          const progressElement = $("#file-progress");
          const uploadConcluited = $(".concluited-upload");

          $(progressElement).attr("hidden", true);
          $(uploadConcluited).attr("hidden", false);

          confirmUpload();
        }

        function confirmUpload() {
          const nameFile = response.filename;

          const settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/api/upload/confirm",
            "method": "POST",
            "headers": {
              "Content-Type": "application/json"
            },
            "processData": false,
            "data": JSON.stringify({ "filename": `${nameFile}`})
          };
          
          $.ajax(settings).done(function (response) {
            console.log(response);
          });
        }

      } catch (error) {
        console.log(error);
      }
    });
  });
});
