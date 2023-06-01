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
  });
});
