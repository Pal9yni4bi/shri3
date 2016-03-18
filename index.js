(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
		control = document.querySelector('.controls__filter'),
		context = canvas.getContext("2d");

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
					  if (window.URL) {
						video.src = window.URL.createObjectURL(stream);
					  } else {
						video.src = stream;
					  }
                    // video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };
	
	var InvertFilter = function(input) {
		var width = input.width, height = input.height,
			inputData = input.data;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				for(var i = 0; i < 3; i++){
					inputData[pixel+i] = 255 - inputData[pixel+i];
				}
			}  
		}
	}
	var GrayscaleFilter = function(input) {
		var width = input.width, height = input.height,
			inputData = input.data;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4,
					luma = inputData[pixel]*0.3 + inputData[pixel+1]*0.59 + inputData[pixel+2]*0.11;
				inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = luma;
			}   
		}
	}
	var ThresholdFilter = function(input) {
		var threshold = 127,
			width = input.width, height = input.height;
			inputData = input.data;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4,
					brightness = (inputData[pixel] + inputData[pixel+1] + inputData[pixel+2])/3,
					colorVal = 0;
				if(brightness > threshold){
					colorVal = 255;
				}
				inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = colorVal;
			}   
		}
	}
    var applyFilter = function () {
		var data = context.getImageData(0,0,canvas.width, canvas.height),
			filterName = control.value;
		switch(filterName) {
		  case 'invert':
			new InvertFilter(data);
			break;
		  case 'grayscale':
			new GrayscaleFilter(data);
			break;
		  case 'threshold':
			new ThresholdFilter(data);
			break;
		  default:
			console.log("Something wrong with filter-choosing function");
			break;
		}
		context.putImageData(data,0,0);
    };

    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 16);
    });
})();