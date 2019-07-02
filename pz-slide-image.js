(function() {
    function SildeImage(slide) {
        var _this_ = this;
        this.slide = slide;
        this.images = refreshImages();
        this.slideMainImage = $("#slide-image-change", slide);
        this.slideBox = $("#slide-box ul", slide);
        this.imagesList = $("li", this.slideBox);
        this.imagesSize = this.imagesList.size();
        //加载提示
        this.loadingState = $("#loading-state", slide);
        //滑块
        if (this.imagesSize >= 7) {
            if (this.imagesSize != 7) {
                this.slideTrack = $("#scrollbar-track", slide);
                this.sliderHandle = $(".scrollbar-handle", slide);
                this.trackAndHandleWidth = this.slideTrack.width() - this.sliderHandle.width();
                //事件
                this.sliderHandle.mousedown(function(e) {
                    _this_.slideSelectedFrame.fadeOut();
                    _this_.layerX = e.pageX - $(this).offset().left;
                    $(document).bind("mousemove", function(e) { _this_.mouseMove(e); });
                    $(document).bind("mouseup", function() { _this_.cancelEvents(); });;
                });
                this.imagesHideWidth = this.imagesSize * 126 - this.slideBox.parent().width() - 10;
            };
            this.slideBox.width(this.imagesSize * 126);
        };
        this.slideSelectedFrame = $("#slide-selected-frame", slide);
        this.imagesList.click(function() {
            _this_.goto(this);
            updateVote(_this_);
        });
        //切换计数
        this.loop = 0;
        this.slideListBtnPrev = $(".slide-list-btn-prev", slide);
        this.slideListBtnNext = $(".slide-list-btn-next", slide);
        this.slideListBtnPrev.click(function() {
            _this_.loop--;
            if (_this_.loop < 0) {
                _this_.loop = _this_.imagesSize - 1;
            };
            _this_.imagesList.eq(_this_.loop).click();
        });
        this.slideListBtnNext.click(function() {
            _this_.loop++;
            if (_this_.loop > _this_.imagesSize - 1) {
                _this_.loop = 0;
            };
            _this_.imagesList.eq(_this_.loop).click();
        });
        //切换
        this.slideBtnPrev = $(".slide-btn-prev", slide);
        this.slideBtnNext = $(".slide-btn-next", slide);
        this.slideBtnPrev.click(function() {
            _this_.slideListBtnPrev.click();
        });
        this.slideBtnNext.click(function() {
            _this_.slideListBtnNext.click();
        });
        //翻页
        $(document).keyup(function(e) {
            if (e.which == 37) {
                _this_.slideListBtnPrev.click();
            };
        });
        $(document).keyup(function(e) {
            if (e.which == 39) {
                _this_.slideListBtnNext.click();
            };
        });
        this.viewBigImg = $("#slide-origin-url", slide);
        this.reloadPageInto();
        this.timer = null;
        this.autoPlayBtn = $("#slide-auto-play", slide);
        this.autoPlayBtn.click(function() {
            if (!this.isAuto) {
                _this_.autoPlay();
                this.isAuto = true;
                $(this).text("暂停播放");
            } else {
                window.clearInterval(_this_.timer);
                this.isAuto = false;
                $(this).text("自动播放");
            };
        });
        //上传
        var input = document.getElementById("slide-upload");
        if (typeof FileReader === 'undefined') {
            alert("抱歉，你的浏览器不支持上传");
            input.setAttribute('disabled', 'disabled');
        } else {
            input.addEventListener('change', this.readFile, false);
        }
        //点赞
        this.voteBtn = $("#slide-vote", slide);
        this.voteBtn.click(function() {
            _this_.vote();
            updateVote(_this_);
        });

        updateVote(_this_);
    };

    function refreshImages() {
        var allNames = Array;
        $.ajax({
            async: false,
            type: "post",
            url: "allnames.php",
            data: {}, 
            dataType: "json",
            success: function(msg) {
                allNames = msg;
                console.log(msg);
            },
            error: function(msg) {
                console.log(msg);
            }
        });
        var count = allNames.length;
        var ul = document.getElementById("slide-ul");
        while (ul.hasChildNodes()) {
            ul.removeChild(ul.firstChild);
        }
        for (var i = 0; i < count; i++) {
            var li = document.createElement("li");
            li.setAttribute("data-origin", "image/" + allNames[i].name);
            if (i === 0) {
                li.setAttribute("class", "selected");
                li.innerHTML = '<img src=image-l/' + allNames[i].name + ' height="68" ' + '/><span>' + (i + 1) + '/' + count + '</span>';
            } else {
                li.innerHTML = '<img src=image-l/' + allNames[i].name + ' height="68" ' + '/><span>' + (i + 1) + '/' + count + '</span>';
            }
            ul.appendChild(li);
        }
        return allNames
    }
    function fileUpload(fileName, file) {
        var fd = new FormData();
        fd.append("pic", file);
        $.ajax({
            async: false,
            type: 'POST',
            url: 'upload.php',
            data: fd,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr;
                if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                } else {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        console.log('进度', percentComplete);
                    }
                }, false);
                alert("文件:" + fileName + " 上传完成。");
                return xhr;
            }
        }).success(function(res) {
            console.log(res);
            //上传成功
        }).error(function(error) {
            console.error(error);
        });
    }
    function updatelist() {
        window.location.reload();
    }
    function updateVote(target) {
        document.getElementById("slide-num").innerHTML = target.images[target.loop].votes;
    }

    SildeImage.prototype = {
        vote: function() {
            var url = this.imagesList.eq(this.loop).attr("data-origin");
            var pos = url.lastIndexOf('/');
            var name = url.substring(pos + 1);
            var num;
            $.ajax({
                async: false,
                type: "post",
                url: "vote.php",
                data: { name: name },
                dataType: "json", 
                success: function(msg) {
                    num = msg;
                    console.log(msg);
                },
                error: function(msg) {
                    console.log(msg);
                }
            });
            this.images[this.loop].votes = num;
        },
        readFile: function() {
            var iLen = this.files.length;
            for (var i = 0; i < iLen; i++) {
                var file = this.files[i];
                //添加一层过滤
                var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
                if (!rFilter.test(file.type)) {
                    alert("文件格式必须为图片: " + file.name);
                    return;
                }
            }
            for (var i = 0; i < iLen; i++) {
                var file = this.files[i];
                fileUpload(file.name, file);
            }
            refreshImages();
            updatelist();
        },
        changeBigImg: function(target) {
            var _this = this;
            var url = $(target).attr("data-origin");
            this.loadingState.show();
            //加载大图
            this.preLoadImg(url, function() {
                _this.slideMainImage.attr("src", url);
                _this.loadingState.fadeOut();
            });

        },
        preLoadImg: function(url, callBack) {
            var img = new Image();
            if (!!window.ActiveXObject) {
                img.onreadystatechange = function() {
                    if (this.readyState == "complete") {
                        callBack();
                    };
                };
            } else {
                img.onload = function() {
                    callBack();
                };
            };
            img.src = url;
        },
        //自动播放
        autoPlay: function() {
            var _this = this;
            this.timer = window.setInterval(function() {
                _this.slideBtnNext.click();
            }, 5000);
        },
        reloadPageInto: function() {
            var url = window.location.href,
                url = url.split("#")[1] || "page1",
                pageIndex = parseInt(url.substr(4));
            this.imagesList.eq(pageIndex - 1).click();
            //设置计数
            this.loop = pageIndex - 1;
        },
        goto: function(target) {
            var index = $(target).index();
            this.imagesList.eq(index).addClass("selected").siblings().removeClass("selected");
            this.loop = index;
            var url = window.location.href.split("#")[0];
            window.location.href = url + "#page" + (index + 1);
            if (this.slideSelectedFrame.is(":hidden")) {
                this.slideSelectedFrame.fadeIn();
            };
            //查看原图href
            this.viewBigImg.attr("href", this.imagesList.eq(index).attr("data-origin"));

            //切换图片
            this.changeBigImg(target);
            if (this.imagesSize <= 7) {
                if (index == 6) {
                    this.slideSelectedFrame.animate({ "left": index * 126 - 3 });
                } else {
                    this.slideSelectedFrame.animate({ "left": index * 126 });
                };
            } else {
                if (index <= 3) {
                    this.slideSelectedFrame.animate({ "left": index * 126 });
                    this.slideBox.animate({ marginLeft: 0 });
                    if (this.sliderHandle) {
                        this.sliderHandle.animate({ marginLeft: 0 });
                    };
                } else if (index > 3 && index < this.imagesSize - 3) {
                    this.slideSelectedFrame.animate({ "left": 3 * 126 });
                    this.slideBox.animate({ marginLeft: -(index - 3) * 126 });
                    var bili = (index - 3) * 126 / this.imagesHideWidth;
                    this.sliderHandle.animate({ marginLeft: bili * this.trackAndHandleWidth });
                } else {
                    if (index == this.imagesSize - 1) {
                        this.slideSelectedFrame.animate({ "left": (7 - (this.imagesSize - index)) * 126 - 3 });
                    } else {
                        this.slideSelectedFrame.animate({ "left": (7 - (this.imagesSize - index)) * 126 });
                    };
                    this.slideBox.animate({ marginLeft: -(this.imagesSize - 7) * 126 });
                    this.sliderHandle.animate({ marginLeft: this.trackAndHandleWidth });
                };
            };
        },
        mouseMove: function(e) {
            var moveLayerX = e.pageX - this.slideTrack.offset().left - this.layerX;
            moveLayerX = moveLayerX < 0 ? 0 : moveLayerX > this.trackAndHandleWidth ? this.trackAndHandleWidth : moveLayerX;
            this.sliderHandle.css("marginLeft", moveLayerX);
            this.slideBox.css("marginLeft", -((moveLayerX / this.trackAndHandleWidth).toFixed(3) * this.imagesHideWidth));
        },
        cancelEvents: function() {
            $(document).unbind("mousemove");
            $(document).unbind("mouseup");
            var i = Math.round(Math.abs(parseInt(this.slideBox.css("marginLeft")) / 116)) > this.imagesSize - 7 ? this.imagesSize - 7 : Math.round(Math.abs(parseInt(this.slideBox.css("marginLeft")) / 116));
            this.slideBox.animate({ marginLeft: -i * 126 });
            var bili = i * 126 / this.imagesHideWidth;
            this.sliderHandle.animate({ marginLeft: bili * this.trackAndHandleWidth });
        }

    };
    window["SildeImage"] = SildeImage;
})();