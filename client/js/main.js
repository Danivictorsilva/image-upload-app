import { BlobServiceClient } from "@azure/storage-blob"
import { requestHelper } from './requestHelper'

$(document).ready(function () {
  const inputFile = $("#picture__input")
  const pictureImage = $(".picture__image")
  const pictureImageTxt = "Anexar uma arquivo"
  $(pictureImage).attr("innerHTML", pictureImageTxt)

  inputFile.on("change", function (e) {
    const inputTarget = e.target
    const file = inputTarget.files[0]

    if (file) {
      const reader = new FileReader()

      $(reader).on("load", function (event) {
        const readerTarget = event.target

        const img = $("<img></img>")
        $(img).attr("src", readerTarget.result)
        img.addClass("picture__img")

        $(pictureImage).html("")
        $(pictureImage).append(img)
      })

      reader.readAsDataURL(file)
    } else {
      $(pictureImage).attr("innerHTML", pictureImageTxt)
    }

    $(".btn-send-file").on("click", sendFile)
  })
})

async function sendFile() {
  try {
    /**
     * @type {File}
     */
    const file = $("#picture__input")[0].files[0]

    const { origin: domain, search: sasToken, pathname: path } = await requestHelper.getSasToken()

    const [containerName, filename] = path.split('/').slice(1)

    const blobClient = new BlobServiceClient(`${domain}${sasToken}`)
      .getContainerClient(containerName)
      .getBlockBlobClient(filename)

    await blobClient.uploadData(file, {
      onProgress: (progress) => {
        calculateProgress(progress, file.size, filename)
      },
      blobHTTPHeaders: {
        blobContentType: file.type,
      },
    })
  } catch (error) {
    console.log(error)
  }
}


function calculateProgress(progress, sizeFile, filename) {
  const progressMultiplicated = progress.loadedBytes * 100
  const valueProgress = progressMultiplicated / sizeFile

  showProgress(valueProgress, filename)
}

function showProgress(valueProgress, filename) {
  const progressElement = $("#file-progress")

  $(progressElement).attr("hidden", false)
  $(progressElement).attr("value", valueProgress)

  if (valueProgress == 100) {
    progressConcluded(filename)
  }
}

function progressConcluded(filename) {
  const progressElement = $("#file-progress")
  const uploadConcluited = $(".concluited-upload")

  $(progressElement).attr("hidden", true)
  $(uploadConcluited).attr("hidden", false)

  requestHelper.confirmUpload(filename)
}

