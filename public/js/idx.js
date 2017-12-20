$(function() {
    $('input[type="chosenTime"]').bootstrapMaterialDatePicker({
        date: false,
        format: 'HH:mm'
    });;
});

function previewFile() {
    var preview = document.querySelectorAll('img')[1]; //selects the query named img
    var file = document.querySelector('input[type=file]').files[0]; //sames as here
    var reader = new FileReader();

    reader.onloadend = function() {
        preview.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.src = "";
    }
}

previewFile();