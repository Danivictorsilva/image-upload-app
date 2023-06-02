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
        const blobServiceClient = new BlobServiceClient(response.sasuri);

        const containerClient = blobServiceClient.getContainerClient(response.container);

        const blobClient = containerClient.getBlockBlobClient(response.filename);

        const archive = $("#picture__input")[0].files[0];

        blobClient.uploadBrowserData(archive);

      } catch (error) {
        console.log(error);
      }
    });
  });
});
