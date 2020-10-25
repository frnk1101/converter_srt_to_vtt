/**
 * @version 20201011
 * @author moto1101
 * @description A NodeJS application which converts video captions from SRT to VTT.
 *
 MIT License

 Copyright 2020 moto1101

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
Test file SRT

1
00:00:00,030 --> 00:00:03,040
test 1, hello

2
00:01:00,030 --> 00:02:03,040
test 2, hello
*/

/*
Test file VTT

WEBVTT

1
00:00:00.030 --> 00:00:03.040
test 1, hello

2
00:01:00.030 --> 00:02:03.040
test 2, hello
*/

"use strict";

class C_GUI{
  f_GUI(BASE){
    try {
      document.querySelectorAll('body')[0].BASE = BASE;
      document.querySelectorAll('body')[0].style = 'background: #444444; color: #dddddd;font-size: 2em; text-align: center; position: fixed; width: 100%; height: 100%; left: 0px; top: 0px; overflow: hidden; padding-top: 20%;';
      document.querySelectorAll('body')[0].innerHTML = 'Convert SRT to VTT. <br/>Drop SRT file here.';

      document.querySelectorAll('body')[0].addEventListener('dragover', this.f_dragHandler);
      document.querySelectorAll('body')[0].addEventListener('drop', this.f_dropHandler);
    } catch (error) {
      console.log(error);
    }
  }

  f_dropHandler(event){
    try{
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      let file = event.dataTransfer.files;
      document.querySelectorAll('body')[0].BASE.filename = file[0].name;

      let reader = new FileReader();
      reader.addEventListener("load", function(event) {
        let BASE = document.querySelectorAll('body')[0].BASE;
        BASE.srt = event.target.result;
        BASE.converter.controller.f_ConvertData(BASE);
      });
      reader.readAsText(file[0]); // 'utf-8'
    } catch (error) {
      console.log(error);
    }
  }


  f_dragHandler(event){
    try{
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    } catch (error) {
      console.log(error);
    }
  }

}

class C_Converter {
	f_ConvertData(BASE) {
		try {
			if (BASE.srt.error) {
				throw data_in.error;
			}
      BASE.vtt = 'WEBVTT \n\n' + BASE.srt; // add needed text
      BASE.vtt = BASE.vtt.replace(BASE.regex, "$1.$3"); // replace commas by dots
			BASE.converter.fileIO.f_WriteFile(BASE);
		} catch (error) {
			console.log(error);
		}
	}
}

class C_FileIO {
	f_ReadFile(BASE) {
		try {
			let f_callback = function(err, data){
        BASE.srt = data;
				BASE.converter.controller.f_ConvertData(BASE);
			}
      if(BASE.filesystem){
        BASE.filesystem.readFile("./" + BASE.filename, "utf8", f_callback);
      }

		} catch (error) {
			console.log(error);
		}
	}

	f_WriteFile(BASE) {
		try {
      BASE.filename = BASE.filename.split('.')[0] + '.vtt';
      if(typeof BASE.filesystem.writeFile !== 'function'){
        // WEB
        let dataStr = BASE.vtt; // content
        let dataUri = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(dataStr);
        let filename = BASE.filename;
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', filename);
        linkElement.click();
        window.open("data:text/vtt; charset=utf-8," + encodeURIComponent(dataStr));
      }else{
        // NodeJS
        BASE.filename = './' + BASE.filename;
        BASE.filesystem.writeFile(BASE.filename, BASE.vtt, error => {
  				if (error) {
            throw error;
          }
  			});
      }

		} catch (error) {
			console.log(error);
		}
	}
}

function main() {
	try {
    var BASE = {};
		BASE = {
      filename: '',
      filesystem: {},
      converter: {
        controller: new C_Converter(),
        fileIO: new C_FileIO(),
        GUI: new C_GUI()
      },
      regex: /(\d\d:\d\d:\d\d)+(\,)+(\d\d\d)/g,
      srt: '',
      vtt: ''
    };

    if (typeof BASE.filename === 'undefined') {
      console.log('Missing argument. \nEnter node <app> <srt file>');
      return {success: false};
    }

    if(typeof window !== 'undefined'){
      BASE.converter.GUI.f_GUI(BASE);
    }else{
      BASE.filename = process.argv[2];
      BASE.filesystem = require("fs");
      BASE.converter.fileIO.f_ReadFile(BASE); // nodejs
    }
	} catch (error) {
		console.log(error);
	}
}

main();
