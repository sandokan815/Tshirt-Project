    // global arrays, using products json buffer 
    var JsonFrontLeftString = [],
      JsonFrontRightString = [],
      JsonLeftString = [],
      JsonRightString = [],
      JsonBackString = [];
    // lastest selected product canvas name
    var lastProductCanvasName = "";
    /**

    The main project controlling object

    ***/

    window.TShirt = {
      canvas: null, // design div canvas, edit design items on this canvas 
      activeItem: null, //main activeItem using design div, get currently actived item on design canvas
      canvasBackGround: null, // product div background canvas, consist of cloths background image
      canvasUpLeft: null, // product front left canvas
      canvasUpRight: null, // product front right canvas
      canvasLeft: null, // product left canvas
      canvasBack: null, // product back canvas
      canvasRight: null, // product right canvas
      canvasProduct: null, // product temp canvas, get actived product canvas,  edit product items on this canvas
      constrain: true,
      view_direction: 1, // product direction, up/left/back/right  
      items: [], // consist of design items 
      itemsProduct: [], // consist of product items 
      activeCanvasName: null, // current actived product canvas name
      $options: $(".changestyle"), //consist of text edit panel
      $letterpatchoptions: $("#letterpatch-style"), //consist of text/letter edit panel
      $imageOptions: $("#imageAttributes"), //consist of image/svg edit panel
      $productOptions: $('#product_size'), //consist of product edit panel
      prices: {
        letter: "10$",
        text: "3$",
        image: "5$",
        svg: "5$",
        addedtext: "3$"
      }, // price of products
      CurrentPatch: {
        canvasName: "",
        productid: -1
      }, // currently actived patch on product canvas info
      product_activeitem: '', // currently actived patch on product canvas
      allPrice: 0, //all products price
      //true if overlap checkbox is checked, otherwise false
      get overlap() {
        return $overlap.prop("checked");
      },
      //Initializes canvas and binds events
      init: function () {
        var that = this;
        // get canvas from html
        that.canvasBackGround = new fabric.Canvas("stageBackground");
        that.canvas = new fabric.Canvas("stageDesign");
        that.canvasUpLeft = new fabric.Canvas("stageUpLeft");
        that.canvasUpRight = new fabric.Canvas("stageUpRight");
        that.canvasLeft = new fabric.Canvas("stageLeft");
        that.canvasBack = new fabric.Canvas("stageBack");
        that.canvasRight = new fabric.Canvas("stageRight");

        that.canvasProduct = that.canvasUpLeft;
        that.canvasUpLeft.selection = false;
        that.canvasUpRight.selection = false;
        that.canvasLeft.selection = false;
        that.canvasBack.selection = false;
        that.canvasRight.selection = false;
        that.canvasProduct.selection = false;

        var canvasWidth = $('#stageBackground').attr('width');
        var canvasHeight = $('#stageBackground').attr('height');
        // set init background
        setBackgroundImage(canvasWidth, canvasHeight, "assets/images/front.jpg", 0.85);
        that.canvas.selection = false;
        that.bindEvents();
        ResetLetterPatch();

      },
      // calculate Price,
      // side : string view_direction
      // append html string to price_body tag
      calculatePrice: function (side) {
        var $price_body = $('#price_body');
        $price_body.empty();

        if (side == "front") { // front direction
          TShirt.allPrice = 0;
          for (var k = 0; k < JsonFrontLeftString.length; k++) {
            $price_body.append(GetHtmlElementFromJson(JsonFrontLeftString[k], "Front Left"));
          }
          $price_body.append(GetHtmlElementFromTextObjects("Front Left"));
          for (var k = 0; k < JsonFrontRightString.length; k++) {
            $price_body.append(GetHtmlElementFromJson(JsonFrontRightString[k], "Front Right"));
          }
          $price_body.append(GetHtmlElementFromTextObjects("Front Right"));
          if (TShirt.allPrice == 0) {
            $('#empty_price').show();
            $('#total_price').hide();
          } else {
            $('#empty_price').hide();
            $('#total_price').show();
          }
          $('#total_price').html('');
          $('.total_price').html('Total Price: $' + TShirt.allPrice);

        } else if (side == "left") { // left direction
          TShirt.allPrice = 0;
          //get price from json
          for (var k = 0; k < JsonLeftString.length; k++) {
            $price_body.append(GetHtmlElementFromJson(JsonLeftString[k], "Left"));
          }
          // get TEXT items price
          $price_body.append(GetHtmlElementFromTextObjects("Left"));
          if (TShirt.allPrice == 0) {
            $('#empty_price').show();
            $('#total_price').hide();
          } else {
            $('#empty_price').hide();
            $('#total_price').show();
          }
          $('#total_price').html('');
          $('#total_price').html('Total Price: $' + TShirt.allPrice);

        } else if (side == "back") { // back direction
          TShirt.allPrice = 0;
          for (var k = 0; k < JsonBackString.length; k++) {
            $price_body.append(GetHtmlElementFromJson(JsonBackString[k], "Back"));
          }
          $price_body.append(GetHtmlElementFromTextObjects("Back"));
          if (TShirt.allPrice == 0) {
            $('#empty_price').show();
            $('#total_price').hide();
          } else {
            $('#empty_price').hide();
            $('#total_price').show();
          }
          $('#total_price').html('');
          $('#total_price').html('Total Price: $' + TShirt.allPrice);

        } else if (side == "right") { // right direction
          TShirt.allPrice = 0;
          for (var k = 0; k < JsonRightString.length; k++) {
            $price_body.append(GetHtmlElementFromJson(JsonRightString[k], "Right"));
          }
          $price_body.append(GetHtmlElementFromTextObjects("Right"));
          if (TShirt.allPrice == 0) {
            $('#empty_price').show();
            $('#total_price').hide();
          } else {
            $('#empty_price').hide();
            $('#total_price').show();
          }
          $('#total_price').html('');
          $('#total_price').html('Total Price: $' + TShirt.allPrice);
        }
      },
      //clear and show/hide edit panels and design canvas
      clearDesignPanel: function () {
        var select_menu = $('.menu>.active>.selected').children('a').attr('class');
        $('.EditProductPane').attr('style', 'display:none');
        if (select_menu != 'addText') {
          $('.AddTextPane').attr('style', 'display:none');
          $('.EditTextPane').attr('style', 'display:none');
        }
        $('.AddImagePane').attr('style', 'display:none');
        $('.EditProductPane').attr('style', 'display:none');
        $('.EditImagePane').attr('style', 'display:none');
        $('#letter_tab li').removeClass('selected');
        window.TShirt.items.splice(0, window.TShirt.items.length);
        window.TShirt.canvas.clear().renderAll();
        ResetLetterPatch();
        window.TShirt.CurrentPatch.canvasName = "";
        window.TShirt.CurrentPatch.productid = -1;
      },
      //clear and show/hide edit panels without
      clearDesignControlPanel: function () {
        var select_menu = $('.menu>.active>.selected').children('a').attr('class');
        $('.EditProductPane').attr('style', 'display:none');
        if (select_menu != 'addText') {
          $('.AddTextPane').attr('style', 'display:none');
          $('.EditTextPane').attr('style', 'display:none');
        }
        $('.AddImagePane').attr('style', 'display:none');
        $('.EditProductPane').attr('style', 'display:none');
        $('.EditImagePane').attr('style', 'display:none');
      },
      //set edit panels property like as activeitem property and called when activeitem appeared
      setAttributeOptions: function (activeItem) {
        // text items
        if (activeItem.type == "text" || activeItem.type == "curve") {
          elem = activeItem.elem;
          var options = elem.designOptions;
          $text.val(elem.text);
          $fontSize.val(options.fontSize);
          var select_menu = $('.menu>.active>.selected').children('a').attr('class');
          $fontSizeNum.val($fontSize.val());

          if (typeof (elem.letter_id) != 'undefined') { // init letters property
            $('.letter-style .color .palette-color-picker-button').css('background', options.fill);
            $('.letter-style .letter-border .palette-color-picker-button').css('background', options.borderColor);
            $('.letter-style .letter-innerborder .palette-color-picker-button').css('background', options.innerBorderColor);
            $('.letter-borderstyle').val(options.borderStyle);
            $('.letter-boderwidth').val(options.borderWidth);
            $('.letter-innerborderstyle').val(options.innerBorderStyle);
            $('.letter-innerborderwidth').val(options.innerBorderWidth);
            $('.letter-font-family').val(options.fontFamily);

          } else { // letter items

            if (elem.letter_id == 1) {
              $letter_text1.val(elem.text);
            }
            if (elem.letter_id == 2) {
              $letter_text2.val(elem.text);
            }
            if (elem.letter_id == 3) {
              $letter_text3.val(elem.text);
            }
            $('.EditTextPane .color .palette-color-picker-button').css('background', options.fill);
            $('.EditTextPane .border-textedit .palette-color-picker-button').css('background', options.borderColor);
            $('.EditTextPane .innerborder-textedit .palette-color-picker-button').css('background', options.innerBorderColor);
            $('.edittext-borderstyle').val(options.borderStyle);
            $('.edittext-borderWidth').val(options.borderWidth);
            $('.edittext-innerBorderStyle').val(options.innerBorderStyle);
            $('.edittext-innerBorderWidth').val(options.innerBorderWidth);
            $('.edit-font-family').val(options.fontFamily);
          }
          $drawingStyle.val(options.drawingStyle);
          $curveDegree.val(options.curveDegree);
          $curveValue.val(options.curveDegree);
          $curveBridge.val(options.curveBridge);
          $brigeValue.val(options.curveBridge);
          $italic.prop("checked", options.italic);
          $bold.prop("checked", options.bold);
          $underline.prop("checked", options.underline);
          $textHAlign.val(options.textHAlign);
          $textVAlign.val(options.textVAlign);
          var isArch = $drawingStyle.val() == "Arch",
            isVertical = $drawingStyle.val() == "Vertical"
          isBridge = $drawingStyle.val() == "Bridge text";

          $('.text-spacing').toggle(isArch);
          $('.text-lineheight').toggle(isVertical);
          $curveDegree.toggle(isArch);
          $curveValue.toggle(isArch);
          $curveBridge.toggle(isBridge);
          $brigeValue.toggle(isBridge);
          options.angle = elem.angle;
          angle = 180 - parseInt(angle);
          $angle.val(parseInt(options.angle));
          $angleNum.val($angle.val());
          $spaceSize.val(parseInt(options.spacing));
          $spaceSizeNum.val($spaceSize.val());

          $lineSpacingSize.val(parseFloat(options.lineHeight));
          $lineSpacingSizeNum.val($lineSpacingSize.val());

        } else if (activeItem.type == "image") { // image items
          var elem = activeItem.elem;
          var angle = elem.angle;
          angle = 180 - parseInt(angle);
          activeItem.set("angle", 180 - angle);
          $angle.val(180 - angle);
          $angleNum.val($angle.val());
          var width = activeItem.elem.width;
          $widthInput.val(width);
          $widthInputNum.val(width);
          activeItem.set("width", width);
          var height = activeItem.elem.height;
          $heightInput.val(height);
          $heightInputNum.val(height);
          activeItem.set("height", height);
          $removewhite.prop("checked", activeItem.options.removeWhite);

        } else if (activeItem.type == "path-group") { //svg items, svg type is 'path-group'
          var elem = activeItem.elem;
          var angle = elem.angle;
          angle = 180 - parseInt(angle);
          activeItem.set("angle", 180 - angle);
          $angle.val(180 - angle);
          $angleNum.val($angle.val());
          var width = parseFloat(activeItem.scaleX * activeItem.width);
          $widthInput.val(width);
          $widthInputNum.val(width);
          activeItem.set("width", width);
          var height = parseFloat(activeItem.scaleY * activeItem.height);
          $heightInput.val(height);
          $heightInputNum.val(height);
          activeItem.set("height", height);
        }

      },
      // change edit panels show/hide by activeitem's type
      ChangeEditPanels: function (activeItem) {
        $('.letter_menu').removeClass('selected');
        if (activeItem.type == "text" || activeItem.type == "curve") {
          $('#letter_text_panel').addClass('selected');
          if (typeof (activeItem.elem.letter_id) == 'undefined') {
            changeViewState('addText', 0);
            $('.EditTextPane .container .section.text').show();
            $('.EditTextPane .sub-section.text-size').show();
          } else {
            changeViewState('addLetter', 0);
            $('.letter_menu').removeClass('selected');
            $('.LetterPatch').show();
          }
        } else if (activeItem.type == "image") {
          $('#letter_image_panel').addClass('selected');
          changeViewState('editImage', 0);
        } else if (activeItem.type == "path-group") {
          $('#letter_image_panel').addClass('selected');
          changeViewState('editSvg', 0);
        }
      },
      //Deletes an item from canvas
      deleteItem: function (item) {

        var items = TShirt.items,
          index = items.indexOf(item);
        if (index != -1) {
          TShirt.canvas.remove(item.elem);
          items.splice(index, 1);
          TShirt.syncLayers();
          if (items.length != 0) {
            TShirt.canvas.setActiveObject(items[0].elem);
          }
          TShirt.canvas.deactivateAll().renderAll();
        } else {
          var productItems = TShirt.itemsProduct,
            productIndex = productItems.indexOf(item);
          if (productIndex != -1) {
            TShirt.canvasProduct.remove(item.elem);
            productItems.splice(productIndex, 1);
          }
        }
        TShirt.activeItem = null;
        $text.val("");
      },
      //Binds events of project
      bindEvents: function () {
        var that = this;
        // add text to front left
        $('#textleftadd').on('click', function () {
          var value = $addText.val() || "",
            item = null;
          if (/^\s*$/g.test(value)) {
            return;
          }
          TShirt.canvasProduct = TShirt.canvasUpLeft;
          item = new TextItem($addText.val(), "", window.TShirt.canvasUpLeft);
          item.elem.designOptions.specText = "text";
          item.ensureTextPosition();
          $('.AddText-collapse').removeClass('active-patch');
          if (!TShirt.overlap) {
            if (!item.setRenderPosition()) {
              item.elem.remove();
              alert("There is no space to add text");
              return;
            }
          }
          window.TShirt.product_activeitem = item;
          window.TShirt.activeItem = window.TShirt.product_activeitem;
          that.itemsProduct.push(item);
          item.activate();
          item.savePosition();
          item.ensureTextPosition();
          window.TShirt.setAttributeOptions(window.TShirt.activeItem);
          TShirt.canvasUpLeft.renderAll();
          $addText.val("");
        });
        // add text to front right
        $('#textrightadd').on('click', function () {
          var value = $addText.val() || "",
            item = null;
          if (/^\s*$/g.test(value)) {
            return;
          }
          TShirt.canvasProduct = TShirt.canvasUpRight;
          item = new TextItem($addText.val(), "", window.TShirt.canvasUpRight);
          item.elem.designOptions.specText = "text";
          item.ensureTextPosition();
          $('.AddText-collapse').removeClass('active-patch');
          if (!TShirt.overlap) {
            if (!item.setRenderPosition()) {
              item.elem.remove();
              alert("There is no space to add text");
              return;
            }
          }
          window.TShirt.product_activeitem = item;
          window.TShirt.activeItem = window.TShirt.product_activeitem;
          that.itemsProduct.push(item);
          item.activate();
          item.savePosition();
          item.ensureTextPosition();
          window.TShirt.setAttributeOptions(window.TShirt.activeItem);
          TShirt.canvasUpRight.renderAll();
          $addText.val("");
        });
        //Adds TextItem
        $btnAdd.on({
          click: function () {
            var value = $addText.val() || "",
              item = null;
            if (/^\s*$/g.test(value)) {
              return;
            }
            // when text patch enabled,
            var select_menu = $('.menu>.active>.selected').children('a').attr('class');
            if (select_menu == 'addText') {
              // add text to left product canvas
              if (window.TShirt.view_direction == 2) {
                TShirt.canvasProduct = TShirt.canvasLeft;
                item = new TextItem($addText.val(), "", window.TShirt.canvasLeft);
                item.elem.designOptions.specText = "text";
                item.ensureTextPosition();
                $('.AddText-collapse').removeClass('active-patch');
                if (!TShirt.overlap) {
                  if (!item.setRenderPosition()) {
                    item.elem.remove();
                    alert("There is no space to add text");
                    return;
                  }
                }
                window.TShirt.product_activeitem = item;
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                that.itemsProduct.push(item);
                item.activate();
                item.savePosition();
                item.ensureTextPosition();
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
                // TShirt.syncLayers();
                TShirt.canvasLeft.renderAll();
                $addText.val("");

              } else if (window.TShirt.view_direction == 3) { // add text to back product canvas
                TShirt.canvasProduct = TShirt.canvasBack;
                item = new TextItem($addText.val(), "", window.TShirt.canvasBack);
                item.elem.designOptions.specText = "text";
                item.ensureTextPosition();
                // $('.panes').css('height','550px');
                $('.AddText-collapse').removeClass('active-patch');
                if (!TShirt.overlap) {
                  if (!item.setRenderPosition()) {
                    item.elem.remove();
                    alert("There is no space to add text");
                    return;
                  }
                }
                window.TShirt.product_activeitem = item;
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                that.itemsProduct.push(item);
                item.activate();
                item.savePosition();
                item.ensureTextPosition();
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
                // TShirt.syncLayers();
                TShirt.canvasBack.renderAll();
                $addText.val("");

              } else if (window.TShirt.view_direction == 4) { // add text to right product canvas
                TShirt.canvasProduct = TShirt.canvasRight;
                item = new TextItem($addText.val(), "", window.TShirt.canvasRight);
                item.elem.designOptions.specText = "text";
                item.ensureTextPosition();
                $('.AddText-collapse').removeClass('active-patch');
                if (!TShirt.overlap) {
                  if (!item.setRenderPosition()) {
                    item.elem.remove();
                    alert("There is no space to add text");
                    return;
                  }
                }
                window.TShirt.product_activeitem = item;
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                that.itemsProduct.push(item);
                item.activate();
                item.savePosition();
                item.ensureTextPosition();
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
                TShirt.canvasRight.renderAll();
                $addText.val("");
              }

            } else { // add original text using letter patch to design canvas
              item = new TextItem($addText.val(), "", window.TShirt.canvas);
              item.ensureTextPosition();
              $('.AddText-collapse').removeClass('active-patch');
              if (!TShirt.overlap) {
                if (!item.setRenderPosition()) {
                  item.elem.remove();
                  alert("There is no space to add text");
                  return;
                }
              }
              that.items.push(item);
              item.activate();
              item.savePosition();
              item.set('fontSize', 48);
              window.TShirt.setAttributeOptions(item);
              TShirt.syncLayers();
              TShirt.canvas.renderAll();
              $addText.val("");
            }
          }
        });
        //Deletes active activeItem
        $btnDelete.on({

          click: function () {
            var activeItem = TShirt.activeItem;
            if (!activeItem) {
              return;
            }
            ResetTextPatch();
            that.deleteItem(activeItem);
          }
        });
        //Moves TextItem up a layer
        $btnUp.on({
          click: function () {
            if (that.activeItem) {
              // SwapItems("BringUp",that.activeItem,window.TShirt.items);
              that.canvas.bringForward(that.activeItem.elem);
              TShirt.syncLayers();
              that.canvas.renderAll();
            }
          }
        });
        //Moves TextItem down a layer
        $btnDown.on({
          click: function () {
            if (that.activeItem) {
              // SwapItems("BringDown",that.activeItem,window.TShirt.items);
              that.canvas.sendBackwards(that.activeItem.elem);
              TShirt.syncLayers();
              that.canvas.renderAll();
            }
          }
        });

        /***
          canvas events
          hide/show edit panels state
          set attribute of seleted items 
        ***/

        // process product background event
        that.canvasBackGround.on({
          "mouse:down": function (e) {
            var elem = e.target,
              activeProductItem = TShirt.itemsProduct.filter(function (item) {
                if (typeof (item.elem) != 'undefined') {
                  return item.elem == elem;
                } else {
                  return item == elem;
                }
              })[0];
            if (elem == null) {
              ChangeCanvasEnableState("hideline");
              if (that.canvasUpLeft._activeObject != null || that.canvasUpLeft._activeGroup != null) {
                that.canvasUpLeft.deactivateAll().renderAll();
              }
              if (that.canvasUpRight._activeObject != null || that.canvasUpRight._activeGroup != null) {
                that.canvasUpRight.deactivateAll().renderAll();
              }
              if (that.canvasLeft._activeObject != null || that.canvasLeft._activeGroup != null) {
                that.canvasLeft.deactivateAll().renderAll();
              }
              if (that.canvasRight._activeObject != null || that.canvasRight._activeGroup != null) {
                that.canvasRight.deactivateAll().renderAll();
              }
              if (that.canvasBack._activeObject != null || that.canvasBack._activeGroup != null) {
                that.canvasBack.deactivateAll().renderAll();
              }
              window.TShirt.clearDesignPanel();
              activeProductItem = null;
              $productSizeTag.hide();
              $('#letter_tab li').removeClass("selected");
              ResetTextPatch();
            }
            window.TShirt.product_activeitem = '';
          }
        });
        // process canvasUpRight events
        that.canvasUpRight.on({
          "mouse:down": function (e) {
            var elem = e.target,
              activeProductItem = TShirt.itemsProduct.filter(function (item) {
                if (typeof (item.elem) != 'undefined') {
                  return item.elem == elem;
                } else {
                  return item == elem;
                }
              })[0];
            window.TShirt.product_activeitem = activeProductItem;
            if (activeProductItem != null) {

              if (typeof (activeProductItem.productid) != 'undefined') { //original product item
                console.log(activeProductItem);
                $productSizeTag.show();
                $productSize.val(elem.scaleX);
                $productSizeNum.val(elem.scaleX);
              } else { //text item
                $('.MenuBar .addText').click();
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
                window.TShirt.activeItem.activate();
              }

            } else {
              ResetTextPatch();
              window.TShirt.clearDesignPanel();
              $productSizeTag.hide();
              return;
            }
            // product canvas >>> json >>>> design canvas
            if (typeof (activeProductItem.productid) != 'undefined' && JsonFrontRightString[activeProductItem.productid] != "") {
              window.TShirt.clearDesignPanel();
              window.TShirt.CurrentPatch.canvasName = activeProductItem.canvasName;
              window.TShirt.CurrentPatch.productid = activeProductItem.productid;
              GetCanvasObjectFromJson(JsonFrontRightString[activeProductItem.productid], window.TShirt.canvas);
              window.TShirt.clearDesignControlPanel();
              $('#letter_tab li').removeClass("selected");
              showProductDiv("LetterPatch");
            }
          },
          "object:moving": function (e) {
            var elem = e.target;
            elem.setCoords();
            console.log(elem);
            if (elem.getBoundingRect().top < 0 || elem.getBoundingRect().left < 0) {
              elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
              elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
            }
            if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvasProduct.height || elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvasProduct.width) {
              elem.top = Math.min(elem.top, TShirt.canvasProduct.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
              elem.left = Math.min(elem.left, TShirt.canvasProduct.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
            }
            if (window.TShirt.activeItem.type == "text") {
              $textHAlign.val("");
              $textVAlign.val("");
              TShirt.activeItem.set("textHAlign", "", true, true);
              TShirt.activeItem.set("textVAlign", "", true, true);
              TShirt.activeItem.savePosition();
            }
          }
        });
        // process canvasUpLeft events
        that.canvasUpLeft.on({
          "mouse:down": function (e) {
            var elem = e.target,
              activeProductItem = TShirt.itemsProduct.filter(function (item) {
                if (typeof (item.elem) != 'undefined') {
                  return item.elem == elem;
                } else {
                  return item == elem;
                }
              })[0];
            window.TShirt.product_activeitem = activeProductItem;
            if (activeProductItem != null) {

              if (typeof (activeProductItem.productid) != 'undefined') {
                console.log(activeProductItem);
                $productSizeTag.show();
                $productSize.val(elem.scaleX);
                $productSizeNum.val(elem.scaleX);
                showProductDiv("LetterPatch");
              } else {
                $('.MenuBar .addText').click();
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
                window.TShirt.activeItem.activate();
              }

            } else {
              ResetTextPatch();
              window.TShirt.clearDesignPanel();
              $productSizeTag.hide();
              return;
            }
            // product canvas >>> json >>>> design canvas
            if (typeof (activeProductItem.productid) != 'undefined' && JsonFrontLeftString[activeProductItem.productid] != "") {
              window.TShirt.clearDesignPanel();
              window.TShirt.CurrentPatch.canvasName = activeProductItem.canvasName;
              window.TShirt.CurrentPatch.productid = activeProductItem.productid;
              GetCanvasObjectFromJson(JsonFrontLeftString[activeProductItem.productid], window.TShirt.canvas);
              window.TShirt.clearDesignControlPanel();
              $('#letter_tab li').removeClass("selected");
              showProductDiv("LetterPatch");
            }
          },

          "object:moving": function (e) {
            var elem = e.target;
            elem.setCoords();
            console.log(elem);
            if (elem.getBoundingRect().top < 0 || elem.getBoundingRect().left < 0) {
              elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
              elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
            }
            if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvasProduct.height || elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvasProduct.width) {
              elem.top = Math.min(elem.top, TShirt.canvasProduct.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
              elem.left = Math.min(elem.left, TShirt.canvasProduct.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
            }
            if (window.TShirt.activeItem.type == "text") {
              $textHAlign.val("");
              $textVAlign.val("");
              TShirt.activeItem.set("textHAlign", "", true, true);
              TShirt.activeItem.set("textVAlign", "", true, true);
              TShirt.activeItem.savePosition();
            }
          }

        });
        // process canvasLeft events
        that.canvasLeft.on({
          "mouse:down": function (e) {
            var elem = e.target,
              activeProductItem = TShirt.itemsProduct.filter(function (item) {
                if (typeof (item.elem) != 'undefined') {
                  return item.elem == elem;
                } else {
                  return item == elem;
                }
              })[0];
            window.TShirt.product_activeitem = activeProductItem;
            if (activeProductItem != null) {

              if (typeof (activeProductItem.productid) != 'undefined') {
                console.log(activeProductItem);
                $productSizeTag.show();
                $productSize.val(elem.scaleX);
                $productSizeNum.val(elem.scaleX);
              } else {
                $('.MenuBar .addText').click();
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
              }

            } else {
              ResetTextPatch();
              window.TShirt.clearDesignPanel();
              $productSizeTag.hide();
              return;
            }
            // product canvas >>> json >>>> design canvas
            if (typeof (activeProductItem.productid) != 'undefined' && JsonLeftString[activeProductItem.productid] != "") {
              // if ( JsonLeftString != "" && lastProductCanvasName != "stageLeft") {
              window.TShirt.clearDesignPanel();
              window.TShirt.CurrentPatch.canvasName = activeProductItem.canvasName;
              window.TShirt.CurrentPatch.productid = activeProductItem.productid;
              GetCanvasObjectFromJson(JsonLeftString[activeProductItem.productid], window.TShirt.canvas);
              window.TShirt.clearDesignControlPanel();
              $('#letter_tab li').removeClass("selected");
              showProductDiv("LetterPatch");
            }
          },
          "object:moving": function (e) {
            var elem = e.target;
            elem.setCoords();
            if (elem.getBoundingRect().top < 0 || elem.getBoundingRect().left < 0) {
              elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
              elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
            }
            if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvasProduct.height || elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvasProduct.width) {
              elem.top = Math.min(elem.top, TShirt.canvasProduct.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
              elem.left = Math.min(elem.left, TShirt.canvasProduct.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
            }
            if (window.TShirt.activeItem.type == "text") {
              $textHAlign.val("");
              $textVAlign.val("");
              TShirt.activeItem.set("textHAlign", "", true, true);
              TShirt.activeItem.set("textVAlign", "", true, true);
              TShirt.activeItem.savePosition();
            }
          }
        });
        // process canvasRight events
        that.canvasRight.on({
          "mouse:down": function (e) {
            var elem = e.target,
              activeProductItem = TShirt.itemsProduct.filter(function (item) {
                if (typeof (item.elem) != 'undefined') {
                  return item.elem == elem;
                } else {
                  return item == elem;
                }
              })[0];
            window.TShirt.product_activeitem = activeProductItem;
            if (activeProductItem != null) {

              if (typeof (activeProductItem.productid) != 'undefined') {
                console.log(activeProductItem);
                $productSizeTag.show();
                $productSize.val(elem.scaleX);
                $productSizeNum.val(elem.scaleX);
              } else {
                $('.MenuBar .addText').click();
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
              }

            } else {
              ResetTextPatch();
              window.TShirt.clearDesignPanel();
              $productSizeTag.hide();
              return;
            }
            // product canvas >>> json >>>> design canvas
            if (typeof (activeProductItem.productid) != 'undefined' && JsonRightString[activeProductItem.productid] != "") {
              window.TShirt.clearDesignPanel();
              window.TShirt.CurrentPatch.canvasName = activeProductItem.canvasName;
              window.TShirt.CurrentPatch.productid = activeProductItem.productid;
              GetCanvasObjectFromJson(JsonRightString[activeProductItem.productid], window.TShirt.canvas);
              window.TShirt.clearDesignControlPanel();
              $('#letter_tab li').removeClass("selected");
              showProductDiv("LetterPatch");
            }
          },
          "object:moving": function (e) {
            var elem = e.target;
            elem.setCoords();
            if (elem.getBoundingRect().top < 0 || elem.getBoundingRect().left < 0) {
              elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
              elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
            }
            if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvasProduct.height || elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvasProduct.width) {
              elem.top = Math.min(elem.top, TShirt.canvasProduct.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
              elem.left = Math.min(elem.left, TShirt.canvasProduct.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
            }
            if (window.TShirt.activeItem.type == "text") {
              $textHAlign.val("");
              $textVAlign.val("");
              TShirt.activeItem.set("textHAlign", "", true, true);
              TShirt.activeItem.set("textVAlign", "", true, true);
              TShirt.activeItem.savePosition();
            }
          }
        });
        // process canvasBack events
        that.canvasBack.on({
          "mouse:down": function (e) {
            var elem = e.target,
              activeProductItem = TShirt.itemsProduct.filter(function (item) {
                if (typeof (item.elem) != 'undefined') {
                  return item.elem == elem;
                } else {
                  return item == elem;
                }
              })[0];
            window.TShirt.product_activeitem = activeProductItem;
            if (activeProductItem != null) {

              if (typeof (activeProductItem.productid) != 'undefined') {
                console.log(activeProductItem);
                $productSizeTag.show();
                $productSize.val(elem.scaleX);
                $productSizeNum.val(elem.scaleX);
              } else {
                $('.MenuBar .addText').click();
                window.TShirt.activeItem = window.TShirt.product_activeitem;
                window.TShirt.setAttributeOptions(window.TShirt.activeItem);
              }

            } else {
              ResetTextPatch();
              window.TShirt.clearDesignPanel();
              $productSizeTag.hide();
              return;
            }
            // product canvas >>> json >>>> design canvas
            if (typeof (activeProductItem.productid) != 'undefined' && JsonBackString[activeProductItem.productid] != "") {
              window.TShirt.clearDesignPanel();
              window.TShirt.CurrentPatch.canvasName = activeProductItem.canvasName;
              window.TShirt.CurrentPatch.productid = activeProductItem.productid;
              GetCanvasObjectFromJson(JsonBackString[activeProductItem.productid], window.TShirt.canvas);
              window.TShirt.clearDesignControlPanel();
              $('#letter_tab li').removeClass("selected");
              showProductDiv("LetterPatch");
            }
          },
          "object:moving": function (e) {
            var elem = e.target;
            elem.setCoords();
            if (elem.getBoundingRect().top < 0 || elem.getBoundingRect().left < 0) {
              elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
              elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
            }
            if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvasProduct.height || elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvasProduct.width) {
              elem.top = Math.min(elem.top, TShirt.canvasProduct.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
              elem.left = Math.min(elem.left, TShirt.canvasProduct.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
            }
            if (window.TShirt.activeItem.type == "text") {
              $textHAlign.val("");
              $textVAlign.val("");
              TShirt.activeItem.set("textHAlign", "", true, true);
              TShirt.activeItem.set("textVAlign", "", true, true);
              TShirt.activeItem.savePosition();
            }
          }
        });
        // process canvas (design canvas) events
        that.canvas.on({
          //When an item is selected, sets item's options into left editing panel
          "mouse:down": function (e) {
            if ($('#letter_text_panel').attr('class') == 'letter_menu selected') {
              changeViewState('addText', 1);
            }
            if ($('#letter_image_panel').attr('class') == 'letter_menu selected') {
              changeViewState('editImage', 1);
            }

            var elem = e.target,
              activeItem = TShirt.items.filter(function (item) {
                return item.elem == elem;
              })[0];
            if (activeItem != null) {
              if (activeItem.options.type == "path-group") {
                activeItem.rate = parseFloat(activeItem.elem.scaleX / activeItem.elem.scaleY);
              }
              window.TShirt.activeItem = activeItem;
              window.TShirt.setAttributeOptions(window.TShirt.activeItem);
              window.TShirt.ChangeEditPanels(window.TShirt.activeItem);
            }

            window.TShirt.canvas.renderAll();
          },
          "object:selected": function (e) {
            var elem = e.target,
              activeItem = TShirt.items.filter(function (item) {
                return item.elem == elem;
              })[0];
            if (activeItem != null) {
              if (activeItem.options.type == "path-group") {
                activeItem.rate = parseFloat(activeItem.elem.scaleX / activeItem.elem.scaleY);
              }
              window.TShirt.activeItem = activeItem;
              window.TShirt.setAttributeOptions(window.TShirt.activeItem);
              window.TShirt.ChangeEditPanels(window.TShirt.activeItem);
              $('.editimagepane_svg .palette-color-picker-button').remove();
              $('.editimagepane_svg input').remove();
              $('.pattern_container img').remove();
              $('.pattern_container input').remove();
              if (activeItem.type == "path-group") {
                CreateSvgColorpicker(activeItem);
                CreateSvgPatternPicker(activeItem);
              }
            }
            window.TShirt.canvas.renderAll();
          },
          //Resets angle value in left editing panel, when item is rotated in canvas
          "object:rotating": function (e) {
            var elem = e.target,
              activeItem = TShirt.items.filter(function (item) {
                return item.elem == elem;
              })[0];
            if (activeItem != null) {
              window.TShirt.activeItem = activeItem;
              window.TShirt.activeItem.elem.active = true;
              window.TShirt.ChangeEditPanels(window.TShirt.activeItem);
              window.TShirt.setAttributeOptions(window.TShirt.activeItem);
            }
            window.TShirt.canvas.renderAll();
          },
          //Resets vertical and horizontal aligns in left editing panel, when item is moved in canvas
          "object:moving": function (e) {
            var elem = e.target;
            var activeElem = e.target;
            TShirt.activeItem = TShirt.items.filter(function (item) {
              return item.elem == activeElem;
            })[0];
            window.TShirt.ChangeEditPanels(window.TShirt.activeItem);
            if (TShirt.activeItem.type == "image" || TShirt.activeItem.type == "path-group") {
              TShirt.activeItem.set("top", TShirt.activeItem.elem.top);
              TShirt.activeItem.set("left", TShirt.activeItem.elem.left);
            } else {
              $textHAlign.val("");
              $textVAlign.val("");
              TShirt.activeItem.set("textHAlign", "", true, true);
              TShirt.activeItem.set("textVAlign", "", true, true);
              TShirt.activeItem.savePosition();
            }
            elem.setCoords();
            if (elem.getBoundingRect().top < 0 || elem.getBoundingRect().left < 0) {
              elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
              elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
            }
            if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvas.height || elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvas.width) {
              elem.top = Math.min(elem.top, TShirt.canvas.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
              elem.left = Math.min(elem.left, TShirt.canvas.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
            }
          },
          //When item is moved or rotated, checks if it doesn't overlap any other item (allow overlap is false)
          "object:modified": function (e) {
            window.TShirt.canvas.off("object:modified");
            // changeViewState('addText',0);
            var elem = e.target,
              activeItem = TShirt.items.filter(function (item) {
                return item.elem == elem;
              })[0];
            if (activeItem.type == "image" || activeItem.type == "path-group") {
              return;
            }
            if (!activeItem) {
              return;
            }
            activeItem.refreshPosition();
          },
          "object:scaling": function (e) {
            var elem = e.target,
              activeItem = TShirt.items.filter(function (item) {
                return item.elem == elem;
              })[0];
            if (activeItem.type == "path-group") {
              return;
            }
            activeItem.set("scaleX", 1);
            activeItem.set("scaleY", 1);
          }

        });
        //Calls image/svg active item's set prop with relevant input changed value
        TShirt.$imageOptions.find("input, select").on("change input", function () {
          var $input = $(this),
            name = $input.attr("name"),
            activeItem = TShirt.activeItem,
            value = null;

          if ($input.is(":checkbox")) {
            value = $input.is(":checked");
          } else {
            value = $input.val();
          }
          if (name == "removewhitecolor") {
            name = "removeWhite";
            value = $input.is(":checked");
          };

          if (name == "angleNum") {
            $angle.val(value);
            name = "angle";
          }
          if (name == "angle") {
            $angleNum.val(value);
          }
          if (name == "widthInput") {
            $widthInputNum.val(value);
            name = "width";
          }
          if (name == "widthInputNum") {
            $widthInput.val(value);
            name = "width";
          }
          if (name == "heightInput") {
            $heightInputNum.val(value);
            name = "height";
          }
          if (name == "heightInputNum") {
            $heightInput.val(value);
            name = "height";
          }
          if (window.TShirt.constrain == true) {
            if (activeItem.rate == 0) {
              activeItem.rate = activeItem.width / activeItem.height;
              if (activeItem.options.type == "path-group") {
                activeItem.rate = parseFloat(this.scaleX / this.scaleY);
              }
            }
            if (name == "height") {
              activeItem.set("width", activeItem.rate * value);
              $widthInputNum.val(activeItem.rate * value);
              $widthInput.val(activeItem.rate * value);
            } else if (name == "width") {
              var rate = activeItem.elem.height / activeItem.elem.height;
              activeItem.set("height", value / activeItem.rate);
              $heightInputNum.val(value / activeItem.rate);
              $heightInput.val(value / activeItem.rate);
            }
          }
          activeItem.set(name, value);
        });
        //Calls product active item's set prop with relevant input changed value, only zoom
        TShirt.$productOptions.find("input").on("change input", function () {
          var $input = $(this),
            name = $input.attr("name"),
            value = null;
          if (window.TShirt.product_activeitem == '') {
            $('.product-Size').val('1');
            return;
          }
          var activeItem = window.TShirt.product_activeitem;
          value = $input.val();
          if (value > 5) {
            $('.product-SizeNum').val(null);
            return;
          }
          $('.product-SizeNum').val(value);

          if (name == "product-Size") {
            $productSize.val(value);
            name = "product-size";
          }
          if (name == "product-SizeNum") {
            $productSizeNum.val(value);
            name = "product-size";
          }
          if (typeof (activeItem) != 'undefined') {
            activeItem.scaleX = value;
            activeItem.scaleY = value;
          }

          window.TShirt.canvasProduct.renderAll();
        });

        //Handles left editing panel's changes by user
        //Calls letterpacth active item's set prop with relevant input changed value
        TShirt.$letterpatchoptions.find("input, select, textarea").on("change input", function () {
          var $input = $(this),
            name = $input.attr("name"),
            activeItem = TShirt.activeItem,
            value = null;
          //If overlap, return (It is handled by another event)
          if (name == "overlap") {
            return;
          }
          if (!activeItem) {
            return;
          }
          if ($input.is(":checkbox")) {
            value = $input.is(":checked");
          } else {
            value = $input.val();
          }
          if (name == "fontSize") {
            $fontSizeNum.val(value);
            
          }
          if (name == "fontSizeNum") {
            $fontSize.val(value);
            name = "fontSize";
          }
          activeItem.set(name, value);
          activeItem.refreshPosition(true);
        });
        //Calls text active item's set prop with relevant input changed value
        TShirt.$options.find("input, select, textarea").on("change input", function () {
          var $input = $(this),
            name = $input.attr("name"),
            activeItem = TShirt.activeItem,
            value = null;
          if (activeItem == null || activeItem.elem == null || typeof (activeItem.elem) == 'undefined') {
            return;
          }
          if (typeof (activeItem.elem.letter_id) == 'undefined' && $input.hasClass('letter-style-component')) {
            for (var k = 0; k < TShirt.items.length; k++) {
              var obj_item = TShirt.items[k];
              if (typeof (obj_item.elem.letter_id) != 'undefined') {
                obj_item.set(name, $input.val());
                obj_item.refreshPosition(true);
              }
            }
            return;
          }
          //If overlap, return (It is handled by another event)
          if (name == "overlap") {
            return;
          }
          if (!activeItem) {
            return;
          }
          if ($input.is(":checkbox")) {
            value = $input.is(":checked");
          } else {
            value = $input.val();
          }
          if (name == "text") {
            if (typeof (activeItem.elem.letter_id) != 'undefined') {
              value = value.toString().substring(0, 1);
              $text.val(value);
              if (activeItem.elem.letter_id == 1) {
                $('.letter_text1').val(value);
              } else if (activeItem.elem.letter_id == 2) {
                $('.letter_text2').val(value);
              } else if (activeItem.elem.letter_id == 3) {
                $('.letter_text3').val(value);
              }
            }
            TShirt.syncLayers();
          }
          if (name == "fontSize") {
            var lastet =  $fontSizeNum.val();
            $fontSizeNum.val(value);
            // var bounds = activeItem.elem.getBoundingRect();
            // bounds.width = bounds.width * value / lastet;
            // bounds.height = bounds.height * value / lastet;
            // var width = 0;
            // var height = 0;
            // if (TShirt.view_direction == 1) {
            //   width = TShirt.canvasUpLeft.width;
            //   height = TShirt.canvasUpLeft.height;
            // } else 
            // if (TShirt.view_direction == 2) {
            //   width = TShirt.canvasLeft.width;
            //   height = TShirt.canvasLeft.height;
            // } else 
            // if (TShirt.view_direction == 3) {
            //   width = TShirt.canvasBack.width;
            //   height = TShirt.canvasBack.height;
            // } else 
            // if (TShirt.view_direction == 4) {
            //   width = TShirt.canvasRight.width;
            //   height = TShirt.canvasRight.height;
            // }

            // if (bounds.left + bounds.width - 0.01 > width || bounds.top + bounds.height - 0.01 > height) {
            //   $fontSizeNum.val(lastet);
            //   $fontSize.val(lastet);
            //   alert("Text reached its maximum size");
            //   return;
            // }
            
          }
          if (name == "fontSizeNum") {
            var lastet =  $fontSize.val();
            $fontSize.val(value);
            // var bounds = activeItem.elem.getBoundingRect();
            // bounds.width = bounds.width * value / lastet;
            // bounds.height = bounds.height * value / lastet;
            // var width = 0;
            // var height = 0;
            // if (TShirt.view_direction == 1) {
            //   width = TShirt.canvasUpLeft.width;
            //   height = TShirt.canvasUpLeft.height;
            // } else 
            // if (TShirt.view_direction == 2) {
            //   width = TShirt.canvasLeft.width;
            //   height = TShirt.canvasLeft.height;
            // } else 
            // if (TShirt.view_direction == 3) {
            //   width = TShirt.canvasBack.width;
            //   height = TShirt.canvasBack.height;
            // } else 
            // if (TShirt.view_direction == 4) {
            //   width = TShirt.canvasRight.width;
            //   height = TShirt.canvasRight.height;
            // }

            // if (bounds.left + bounds.width - 0.01 > width || bounds.top + bounds.height - 0.01 > height) {
            //   $fontSizeNum.val(lastet);
            //   $fontSize.val(lastet);
            //   alert("Text reached its maximum size");
            //   return;
            // }
            
            name = "fontSize";
          }
          if (name == "curveValue") {
            $curveDegree.val(value);
            name = "curveDegree";
          }
          if (name == "brigeValue") {
            $curveBridge.val(value);
            name = "curveBridge";
          }
          if (name == "angleNum") {
            $angle.val(value);
            name = "angle"; 
            $textHAlign.val("");
            $textVAlign.val("");
            TShirt.activeItem.savePosition();
            TShirt.activeItem.set("textHAlign", "", true, true);
            TShirt.activeItem.set("textVAlign", "", true, true);
            TShirt.activeItem.elem.originX = "center";
            TShirt.activeItem.elem.originY = "center";
           
          }
          if (name == "angle") {
            $angleNum.val(value);
            $textHAlign.val("");
            $textVAlign.val("");
            TShirt.activeItem.savePosition();
            TShirt.activeItem.set("textHAlign", "", true, true);
            TShirt.activeItem.set("textVAlign", "", true, true);
            TShirt.activeItem.elem.originX = "center";
            TShirt.activeItem.elem.originY = "center";
          }
          if (name == "spaceSizeNum") {
            $spaceSize.val(value);
            name = "spacing";
          }
          if (name == "spaceSize") {
            $spaceSizeNum.val(value);
            name = "spacing";
          }
          if (name == "lineSpacingSizeNum") {
            if (activeItem.elem.designOptions.drawingStyle == "Vertical") {
              $lineSpacingSize.val(parseFloat(value));
              name = "lineHeight";
            }

          }
          if (name == "lineSpacingSize") {
            if (activeItem.elem.designOptions.drawingStyle == "Vertical") {
              $lineSpacingSizeNum.val(parseFloat(value));
              name = "lineHeight";
            }
          }

          if (typeof (activeItem.elem.letter_id) != 'undefined') {
            for (var i = 0; i < window.TShirt.items.length; i++) {
              if (typeof (window.TShirt.items[i].elem.letter_id) != 'undefined') {
                window.TShirt.items[i].set(name, value);
                window.TShirt.items[i].refreshPosition(true);
              }
            }
            return;
          }
          activeItem.set(name, value);
          activeItem.refreshPosition(true);
        });
        //Show and hides Arch's and Bridge's value sliders relevant to whether they are selected or not
        $drawingStyle.on("change", function () {
          var $input = $(this),
            isArch = $input.val() == "Arch",
            isVertical = $drawingStyle.val() == "Vertical"
          isBridge = $drawingStyle.val() == "Bridge text";
          $('.text-spacing').toggle(isArch);
          $('.text-lineheight').toggle(isVertical);
          $curveDegree.toggle(isArch);
          $curveValue.toggle(isArch);
          $curveBridge.toggle(isBridge);
          $brigeValue.toggle(isBridge);
        });
        //Synchronizes arch curve degree slider to it's numeric value input
        $curveDegree.on("input change", function () {
          $curveValue.val($(this).val());
        });
        //Synchronizes bridge curve degree slider to it's numeric value input
        $curveBridge.on("input change", function () {
          $brigeValue.val($(this).val());
        });
        //Changes allow overlapping mode
        //If trying to set overlapping to false, checks if there are overlaps. If theye exists rolls back with an alert message
        $overlap.on("change", function () {
          if (!TShirt.overlap && TShirt.hasOverlaps()) {
            $overlap.prop("checked", true).addClass("highlight");
            alert("There are some overlaps. Can not turn off 'Allow Overlaps'.");
          } else {
            $overlap.removeClass("highlight");
          }
          $btnUp.add($btnDown).prop("disabled", !TShirt.overlap);
          $layers.sortable("option", "disabled", !TShirt.overlap);
        });
        $layers.on({
          //When starting to sort an item, saves it's initial position
          sortstart: function (event, ui) {
            ui.item.data('oldIndex', ui.item.index());
          },
          sortstop: function (event, ui) {
            var oldIndex = ui.item.data('oldIndex'),
              newIndex = ui.item.index(),
              objects = TShirt.canvas._objects,
              length = objects.length,
              elem = null;
            if (oldIndex != newIndex) {
              //length - 1 - index (because first item in objects is last item in layers (is drawn the last))
              elem = objects[length - 1 - oldIndex];
              objects.splice(length - 1 - oldIndex, 1);
              objects.splice(length - 1 - newIndex, 0, elem);
              TShirt.canvas.renderAll();
            }
          }
        });


        //Downloads canvas as an jpg or png
        $(".saveButton").on('click', function () {
          console.log("save Button click");
          $('#saveBuffer').attr('download', 'download.png');
          $('#saveBuffer').attr('href', GetLinkProductCanvasToImage());
          $('#saveBuffer').hide();
          this.href = GetLinkProductCanvasToImage();
          this.download = "download.png";
          window.TShirt.canvasBackGround.renderAll();
          var timer = setTimeout(function () {
            $('#saveBuffer').show();
          }, 1000);
        });
      },

      //Checks if any two items in canvas overlap
      hasOverlaps: function () {
        var items = this.items,
          i = -1,
          j = 0,
          c = items.length;
        while (i++ < c) {
          for (j = i + 1; j < c; ++j) {
            if (items[i].elem.intersectsWithObject(items[j].elem)) {
              return true;
            }
          }
        }
        return false;
      },
      //Synchronizes left panel's layer items relevant to canvas items layer order
      syncLayers: function () {
        $layers.html(
          TShirt.canvas._objects.map(function (elem) {
            activeItem = TShirt.items.filter(function (item) {
              return item.elem == elem;
            })[0];
            if (activeItem != null) {
              if (activeItem.type != "image" && activeItem.type != "path-group") {
                var textVal = elem.text;
                if (textVal.length >= 20) {
                  textVal = textVal.toString().substring(0, 17);
                  textVal += "...";
                }
              } else {
                if (activeItem.type == "image") {
                  textVal = activeItem.options.imgname;
                  // with json reload size != problem big code want fix
                  if (!(activeItem.width == 0 || activeItem.height == 0) && (activeItem.width != activeItem.elem.width || activeItem.height != activeItem.elem.height)) {
                    activeItem.set("width", activeItem.width);
                    activeItem.set("height", activeItem.height);
                  }
                }
                if (activeItem.type == "path-group") {
                  textVal = activeItem.options.svgname;
                }
              }
              return "<li class='ui-state-default'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span>" + textVal + "</li>";
            }
          }).reverse().join("")
        );
      }
    };
    /******************************************************************************************************************************
                                                      Modules
                                                      - text patch, type: "text"/"curve"
                                                      - image patch, type: "image"
                                                      - svg patch, type: "path-group" 

    *******************************************************************************************************************************/

    /**
     text patch: TextItem,
     wrapper for fabric Textbox,
     set: Text items,
     type: "text/curve"
     **/
var alertText = false;
    function TextItem(text, options, canvas) {
      this.options = $.extend(true, {}, TextItem.defaultOptions, options);
      this.type = "text";
      this.pCanvas = canvas;
      this.elem = new fabric.Textbox(text, {
        lineHeight: 0.8,
        editable: false,
        designOptions: this.options,
      });
      Object.defineProperties(this, {
        canvas: {
          get: function () {
            return canvas;
          }
        }
      });
      for (var i in this.options) {
        this.set(i, this.options[i], true);
      }
      this.elem.set("strokeLineJoin", "round");
      this.elem.set("strokeLineCap", "round");
      this.top = 0;
      this.left = 0;
      this.angle = 0;
      this.canvas.add(this.elem);
      canvas.renderAll();
    }
    $.extend(TextItem.prototype, {
      //Truncates text if it doesn't fit in canvas
      ensureTextPosition: function () {
        if (!TShirt.activeItem) {
          return "";
        }
        var that = this,
          elem = that.elem,
          canvas = elem.canvas,
          bounds = null,
          text = that.elem.text;
        if (!canvas) {
          return;
        }
        //Repositions text
        elem.setCoords();
        bounds = elem.getBoundingRect();
        //0.01 is for js calculation issues
        if (bounds.left + bounds.width - 0.01 > canvas.width) {
          switch (elem.originX) {
            case "left":
              elem.set("left", canvas.width - bounds.width);  
              break;
            case "center":
              elem.set("left", canvas.width - bounds.width / 2);
              break;
            case "right":
              elem.set("left", canvas.width);
              break;
            default:
              alert();
          }
        }
        if (bounds.top + bounds.height - 0.01 > canvas.height) {
          switch (elem.originY) {
            case "top":
              elem.set("top", canvas.height - bounds.height);
              break;
            case "center":
              elem.set("top", canvas.height - bounds.height / 2);
              break;
            case "bottom":
              elem.set("top", canvas.height);
              break;
            default:
              alert();
          }
        }
        elem.setCoords();
        that.savePosition();
        bounds = elem.getBoundingRect();
        if (bounds.left < 0.01) {
          switch (elem.originX) {
            case "left":
              elem.set("left", 0);
              break;
            case "center":
              elem.set("left", bounds.width / 2);
              break;
            case "right":
              elem.set("left", bounds.width);
              break;
            default:
              alert();
          }
        }
        if (bounds.top < 0.01) {
          switch (elem.originY) {
            case "top":
              elem.set("top", 0);
              break;
            case "center":
              elem.set("top", bounds.height / 2);
              break;
            case "bottom":
              elem.set("top", bounds.height);
              break;
            default:
              alert();
          }
        }
        elem.setCoords();
        that.savePosition();
        bounds = elem.getBoundingRect();
        if (bounds.left + bounds.width - 0.01 > canvas.width || bounds.top + bounds.height - 0.01 > canvas.height) {
          //If text doesn't fit, removes a character and checks again if it fits
          // text = text.slice(0, -1);
          var width = 0;
          var height = 0;

          if (typeof(elem.designOptions.specText) != 'undefined') {
            if (TShirt.view_direction == 1) {
              width = TShirt.canvasUpLeft.width;
              height = TShirt.canvasUpLeft.height;
            } else 
            if (TShirt.view_direction == 2) {
              width = TShirt.canvasLeft.width;
              height = TShirt.canvasLeft.height;
            } else 
            if (TShirt.view_direction == 3) {
              width = TShirt.canvasBack.width;
              height = TShirt.canvasBack.height;
            } else 
            if (TShirt.view_direction == 4) {
              width = TShirt.canvasRight.width;
              height = TShirt.canvasRight.height;
            }
          } else {
            width = TShirt.canvas.width;
            height = TShirt.canvas.height;
          }

          if (elem.getBoundingRect().top < 0 ) {
            elem.top = Math.max(elem.top, elem.top - elem.getBoundingRect().top);
          }
          if (elem.getBoundingRect().left < 0){
            elem.left = Math.max(elem.left, elem.left - elem.getBoundingRect().left);
          }
          if (elem.getBoundingRect().top + elem.getBoundingRect().height > TShirt.canvas.height )
          {
            elem.top = Math.min(elem.top, TShirt.canvas.height - elem.getBoundingRect().height + elem.top - elem.getBoundingRect().top);
          }
          if(elem.getBoundingRect().left + elem.getBoundingRect().width > TShirt.canvas.width) {
            elem.left = Math.min(elem.left, TShirt.canvas.width - elem.getBoundingRect().width + elem.left - elem.getBoundingRect().left);
          }




          var rate = 0;
          if (bounds.left + bounds.width - 0.01 > width) 
          {
            rate = width / (bounds.width);
          }
          if (bounds.top + bounds.height - 0.01 > height) {
            rate = height / (bounds.height);
          }


          
          elem._initDimensions(); 
          if (rate < 1) {
            if (elem.fontSize * rate - 0.2 < 0) {
              return;
            } else {
              $fontSize.val(elem.fontSize * rate - 0.2);
              $fontSizeNum.val(elem.fontSize * rate - 0.2); 
              canvas.renderAll();
              that.set("fontSize", parseFloat(elem.fontSize * rate - 0.2));
            }
            
          }
         
          elem._initDimensions();
          
          if (alertText == false && elem.designOptions.drawingStyle == "Straight") {
            alertText = true;
            // alert("Text reached its maximum size");
          }
          alertText = false;
        }
        if (that == TShirt.activeItem) {
          $text.val(text);
        }
        
        return text || "";
      },
      //Calculates Arch text's radius with given angle
      calculateRadius: function (angle) {
        var that = this,
          radius;
        if (that.options.drawingStyle == "Arch") {
          if (+angle != 0) {
            var space = parseInt(that.elem.spacing),
              textWidth = 0;
            for (var i = 0, len = that.elem.text.length; i < len; i++) {
              textWidth += that.elem.letters.item(i).width + space;
            }
            radius = 180 * textWidth / (+angle * Math.PI);
            that.elem.set("radius", radius);
          }
        }
      },
      //Refereshes text's horizontal position
      refreshHPosition: function () {
        var elem = this.elem,
          canvas = this.canvas;
        var select_menu = $('.menu>.active>.selected').children('a').attr('class');
        if (select_menu == 'addText') {
          canvas = window.TShirt.canvasProduct;
        }
        switch (this.options.textHAlign) {
          case "left":
            elem.set({
              "originX": "left",
              "left": 0
            });
            break;
          case "center":
            elem.set({
              "originX": "center",
              "left": canvas.getWidth() / 2
            });
            break;
          case "right":
            elem.set({
              "originX": "right",
              "left": canvas.getWidth()
            });
            break;
        }
        elem.setCoords();
      },
      //Refereshes text's vertical position
      refreshVPosition: function () {
        var elem = this.elem,
          canvas = this.canvas;
        var select_menu = $('.menu>.active>.selected').children('a').attr('class');
        if (select_menu == 'addText') {
          canvas = window.TShirt.canvasProduct;
        }
        switch (this.options.textVAlign) {
          case "top":
            elem.set({
              "originY": "top",
              "top": 0
            });
            break;
          case "center":
            elem.set({
              "originY": "center",
              "top": canvas.getHeight() / 2
            });
            break;
          case "bottom":
            elem.set({
              "originY": "bottom",
              "top": canvas.getHeight()
            });
            break;
        }
        elem.setCoords();
      },
      //Does relevant changes when drawing style is changed
      refreshDrawingStyle: function (style, oldStyle) {
        var that = this,
          type = this.type,
          text = this.elem.text,
          top = this.elem.top,
          left = this.elem.left,
          index = this.canvas._objects.indexOf(this.elem);
        if (oldStyle == style) {
          return;
        }
        if (style == "Vertical") {
          text = text.split("").join("\n");
          fabric.Text.prototype._reNewline = /\r?\n/;
        } else if (oldStyle == "Vertical") {
          text = text.split("\n").join("");
          fabric.Text.prototype._reNewline = /(?!.*)/;
        }
        that.options.text = text;
        //If set to Arch, creates CurvedText
        if (type == "text" && style == "Arch") {
          that.type = "curve";
          that.elem.remove();
          that.elem = new fabric.CurvedText(text, {
            top: top,
            left: left,
            radius: 2000,
            editable: false,
            lineHeight: 0.8,
            lockScalingX: true,
            lockScalingY: true,
            designOptions: that.options
          });
          for (var i in this.options) {
            this.set(i, this.options[i], true);
          }
          this.elem.set("strokeLineJoin", "round");
          this.elem.set("strokeLineCap", "round");
          this.canvas.add(this.elem);
          //Sets text to it's old layer
          this.canvas._objects.pop();
          this.canvas._objects.splice(index, 0, this.elem);
          this.activate();
        }
        //If unset from Arch creates normal Textbox
        else if (type == "curve" && style != "Arch") {
          that.type = "text";
          that.elem.remove();
          that.canvas.renderAll();
          that.elem = new fabric.Textbox(text, {
            top: top,
            left: left,
            editable: false,
            lineHeight: 0.8,
            designOptions: that.options
          });
          for (var i in this.options) {
            this.set(i, this.options[i], true);
          }
          this.elem.set("strokeLineJoin", "round");
          this.elem.set("strokeLineCap", "round");
          this.canvas.add(this.elem);
          //Sets text to it's old layer
          this.canvas._objects.pop();
          this.canvas._objects.splice(index, 0, this.elem);
          this.activate();
        } else {
          this.elem.set("text", text);
        }
        that.elem.set("dirty", true);
      },
      //Makes item active in canvas
      activate: function () {
        this.canvas.setActiveObject(this.elem);
      },
      //This function is called after user changes some options in left panel
      //It does relevant changes
      set: function (attr, value, skipRender) {
        var that = this,
          oldVal = that.options[attr];
        that.options[attr] = value;
        var borderWidth = +that.elem.designOptions.borderWidth,
          innerBorderWidth = +that.elem.designOptions.innerBorderWidth;
        switch (attr) {
          case "text":
            if (!value) {
              TShirt.deleteItem(that);
              that.elem = null;

              break;
            }
            if (that.options.drawingStyle == "Vertical") {
              value = value.split("\n").join("");
              value = value.split("").join("\n");
            }
            if (that.type == "curve") {
              that.elem.setText(value);
            } else {
              that.elem.set(attr, value);
            }
            if (that.options.drawingStyle == "Arch") {
              that.calculateRadius(that.options.curveDegree);
            }
            break;
          case "angle":
            that.elem.setAngle(value).setCoords();
            break;
          case "borderStyle":
            if (value == "none") {
              that.elem.set("strokeDashArray", null);
              that.elem.set("stroke", null);
            } else if (value == "solid") {
              that.elem.set("strokeDashArray", null);
              that.elem.set("strokeWidth", borderWidth);
              that.elem.set("stroke", that.elem.designOptions.borderColor);
            } else if (value == "dotted") {
              that.elem.set("strokeDashArray", [0, Math.ceil(1.5 * borderWidth)]);
              that.elem.set("strokeWidth", borderWidth);
              that.elem.set("stroke", that.elem.designOptions.borderColor);
            }
            that.elem.setText(that.elem.text);
            break;
          case "borderWidth":
            that.elem.set("strokeWidth", borderWidth);
            if (that.elem.designOptions.borderStyle == "dotted") {
              that.elem.set("strokeDashArray", [0, Math.ceil(1.5 * borderWidth)]);
            }
            that.elem.setText(that.elem.text);
            break;
          case "borderColor":
            if (that.elem.designOptions.borderStyle == "none") {
              return;
            }
            that.elem.set("stroke", value);
            that.elem.setText(that.elem.text);
            break;
          case "innerBorderStyle":
            if (value == "none") {
              that.elem.set("innerStrokeDashArray", null);
              that.elem.set("innerStroke", null);
            } else if (value == "solid") {
              that.elem.set("innerStrokeDashArray", null);
              that.elem.set("innerStrokeWidth", innerBorderWidth);
              that.elem.set("innerStroke", that.elem.designOptions.innerBorderColor);
            } else if (value == "dotted") {
              that.elem.set("innerStrokeDashArray", [0, Math.ceil(1.5 * innerBorderWidth)]);
              that.elem.set("innerStrokeWidth", innerBorderWidth);
              that.elem.set("innerStroke", that.elem.designOptions.innerBorderColor);
            }
            that.elem.setText(that.elem.text);
            break;
          case "innerBorderWidth":
            that.elem.set("innerStrokeWidth", innerBorderWidth);
            if (that.elem.designOptions.innerBorderStyle == "dotted") {
              that.elem.set("innerStrokeDashArray", [0, Math.ceil(1.5 * innerBorderWidth)]);
            }
            that.elem.setText(that.elem.text);
            break;
          case "innerBorderColor":
            if (that.elem.designOptions.innerBorderStyle == "none") {
              return;
            }
            that.elem.set("innerStroke", value);
            that.elem.setText(that.elem.text);
            break;
          case "italic":
            that.elem.set("fontStyle", value ? "italic" : "normal");
            break;
          case "bold":
            that.elem.set("fontWeight", value ? "bold" : "normal");
            break;
          case "underline":
            that.elem.setTextDecoration(value ? "underline" : "normal");
            break;
          case "textHAlign":
            that.refreshHPosition();
            break;
          case "textVAlign":
            that.refreshVPosition();
            break;
          case "drawingStyle":
            $text.hide();
            // when change drawing style, txtDel is Broken, so this bug code
            var hh = $text.css('width');
            $text.css('width', '0px');
            that.refreshDrawingStyle(value, oldVal);
            $text.show();
            var hh = $text.css('width', hh);
            break;
          case "curveDegree":
            that.calculateRadius(value);
            break;
          case "curveBridge":
            that.elem.set("dirty", true);
            break;
          case "lineHeight":
            that.elem.set("lineHeight", parseFloat(value));
            break;
          default:
            that.elem.set(attr, value);
            break;
        }
        if (!skipRender) {
          if (that.elem != null) {
            this.elem.setText(that.ensureTextPosition());
            that.canvas.renderAll();
          }
        }
      },
      //Saves text's position in order to reset to that position if needed
      savePosition: function () {
        if (this.elem != null) {
          this.top = this.elem.top;
          this.left = this.elem.left;
          this.angle = this.elem.angle;
        }
      },
      //Checks if item has any overlapping with other items in canvas
      hasOverlapping: function () {
        var that = this;
        return TShirt.items.some(function (item) {
          return item != that && that.elem.intersectsWithObject(item.elem);
        });
      },
      //Refreshes position of item
      //If overlapping is not allowed and item overlaps, then it's position is reseted
      refreshPosition: function (removeOverlap) {
        var elem = this.elem;
        if (!TShirt.overlap && this.hasOverlapping()) {
          if (removeOverlap) {
            $overlap.prop("checked", true).addClass("highlight");
            alert("There are some overlaps. 'Allow Overlaps' was turned on.");
          } else {
            this.elem.top = this.top;
            this.elem.left = this.left;
            this.elem.angle = this.angle;
            this.elem.setCoords();
          }
        }
        this.savePosition();
      },
      //Finds and sets an empty space for text to be rendered
      setRenderPosition: function () {
        var elem = this.elem,
          self = elem.getBoundingRect(),
          rects = TShirt.items.map(function (item) {
            return item.elem.getBoundingRect();
          }),
          place = {
            top: 0,
            left: 0,
            width: self.width,
            height: self.height
          },
          width = TShirt.canvas.width - place.width,
          height = TShirt.canvas.height - place.height,
          intersect = function (rect) {
            return $.rectsIntersect(place, rect) && (intersectRect = rect);
          },
          intersectRect = null;
        if (!rects.some(function (rect) {
            return $.rectsIntersect(self, rect);
          })) {
          return true;
        }
        for (; place.top < height; ++place.top) {
          for (place.left = 0; place.left < width;) {
            if (rects.some(intersect)) {
              place.left = intersectRect.left + intersectRect.width;
              continue;
            }
            elem.top += place.top - self.top;
            elem.left += place.left - self.left;
            elem.setCoords();
            return true;
          }
        }
        return false;
      }
    });

    /** 
     image module,
     object for image items, type: image
     data : base:64 image data,
     options : image options [""],
     canvas : canvas,
     type : "image"
    **/

    function ImageItem(data, options, canvas) {
      this.data = data;
      this.options = {
        angle: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        scaleX: 0,
        scaleY: 0,
        data: data,
        removeWhite: false,
        imgname: ""
      };
      this.type = "image";
      this.pCanvas = canvas;
      Object.defineProperties(this, {
        canvas: {
          get: function () {
            return canvas;
          }
        }
      });
      this.top = 0;
      this.left = 0;
      this.angle = 0;
      this.width = 0;
      this.height = 0;
      this.scaleX = 0;
      this.scaleY = 0;
      this.rate = 0;
      this.removeWhite = false;
      this.elem = new fabric.Image();
      this.elem.setSrc(data, function (img) {
        var width = img.width;
        var height = img.height;
        if (width > height && width > canvas.width) {
          var rate = height / width;
          width = canvas.width;
          height = width * rate;
        }
        if (height > width && height > canvas.height) {
          var rate = width / height;
          height = canvas.height;
          width = width * rate;
        }
        if (height == width && (width >= canvas.width || height >= canvas.height)) {
          width = height = (canvas.width >= canvas.height) ? canvas.height : canvas.width;
        }
        img.width = width;
        img.height = height;
        canvas.add(img);
        canvas.renderAll();
        window.TShirt.syncLayers();
      });
      this.elem.originX = "center";
      this.elem.originY = "center";
      this.elem.lockUniScaling = true;
      this.elem.lockScalingX = true;
      this.elem.lockScalingY = true;
      this.lockUniScaling = true;
      // remove white background
      // control threshold and distance
      this.removeBackWhite = function (apply) {
        var filter = new fabric.Image.filters.RemoveWhite({
          threshold: 5,
          distance: 10
        });
        if (apply == true) {
          this.elem.filters.push(filter);
        } else {
          this.elem.filters = [];
        }
        this.elem.applyFilters(canvas.renderAll.bind(canvas));
      }
      //set image options
      this.set = function (name, value) {

        if (name == "constrain") {
          window.TShirt.constrain = value;
          if (value == true) {
            this.rate = this.width / this.height;
          } else {
            this.rate = 0;
          }
          return;
        }
        if (name == "angle") {
          this.options.angle = parseFloat(value);
          this.elem.angle = parseFloat(value);
          this.angle = parseFloat(value);
        } else if (name == "width") {
          this.options.width = parseFloat(value);
          this.elem.width = parseFloat(value);
          this.width = parseFloat(value);
        } else if (name == "height") {
          this.options.height = parseFloat(value);
          this.elem.height = parseFloat(value);
          this.height = parseFloat(value);
        } else if (name == "top") {
          this.options.top = parseFloat(value);
          this.elem.top = parseFloat(value);
          this.top = parseFloat(value);
        } else if (name == "left") {
          this.options.left = parseFloat(value);
          this.elem.left = parseFloat(value);
          this.left = parseFloat(value);
        } else if (name == "scaleX") {
          this.options.scaleX = parseFloat(value);
          this.elem.scaleX = parseFloat(value);
          this.scaleX = parseFloat(value);
        } else if (name == "scaleY") {
          this.options.scaleY = parseFloat(value);
          this.elem.scaleY = parseFloat(value);
          this.scaleY = parseFloat(value);
        } else if (name == "removeWhite") {
          this.removeBackWhite(value);
          this.options.removeWhite = value;
          this.elem.removeWhite = value;
          this.removeWhite = value;
        } else if (name == "product_size") {
          this.elem.width = parseFloat(this.elem.width * value);
          this.width = parseFloat(value);
        } else if (name == "imgname") {
          this.elem.imgname = value;
          this.imgname = value;
          this.options.imgname = value;
        }
        canvas.renderAll();
      }

      this.refreshPosition = function () {
        this.set("top", canvas.height / 2);
        this.set("left", canvas.width / 2);
        canvas.renderAll();
      }
    }

    /*
     set svg object klass aync
    */
    function SetSvgObjectElem() {
      tmpObject[tmpOptsCount].elem = tmpElem[tmpOptsCount];
      var color = tmpObject[tmpOptsCount].getFillColorArray();
      tmpObject[tmpOptsCount].setPathsId();
      tmpObject[tmpOptsCount].set("fill", color);
      tmpObject[tmpOptsCount].set("type", "path-group");
      tmpObject[tmpOptsCount].set("constrain", window.TShirt.constrain);
      if (typeof (tmpOpts[tmpOptsCount]) != 'undefined') {
        tmpObject[tmpOptsCount].set("top", tmpOpts[tmpOptsCount].top);
        tmpObject[tmpOptsCount].set("left", tmpOpts[tmpOptsCount].left);
        tmpObject[tmpOptsCount].set("angle", tmpOpts[tmpOptsCount].angle);
        tmpObject[tmpOptsCount].set("width", tmpOpts[tmpOptsCount].width);
        tmpObject[tmpOptsCount].set("height", tmpOpts[tmpOptsCount].height);
        tmpObject[tmpOptsCount].set("scaleX", tmpOpts[tmpOptsCount].scaleX);
        tmpObject[tmpOptsCount].set("scaleY", tmpOpts[tmpOptsCount].scaleY);
        tmpObject[tmpOptsCount].set("svgname", tmpOpts[tmpOptsCount].svgname);
        for (var k = 0; k < tmpOpts[tmpOptsCount].fill.length; k++) {
          if (tmpOpts[tmpOptsCount].fill[k].toString().substring(0, 1) == "#") {
            tmpObject[tmpOptsCount].setFillColorByID(k, tmpOpts[tmpOptsCount].fill[k]);
          } else {
            var pattern = new fabric.Pattern({
              source: tmpOpts[tmpOptsCount].fill[k],
              repeat: "repeat"
            });
            tmpObject[tmpOptsCount].setFillColorByID(k, pattern);

            fabric.Image.fromURL(tmpOpts[tmpOptsCount].fill[k], function (myImg) {
              for (var i = 0; i < tmpObject.length; i++) {
                var escaleX = tmpObject[i].options.scaleX;
                tmpObject[i].set("scaleX", 0);
                TShirt.canvas.renderAll();
                tmpObject[i].set("scaleX", escaleX);
                TShirt.canvas.renderAll();
              }
            });
          }
        }
      }
      tmpObject[tmpOptsCount].asyncAtrributes();
      window.TShirt.items.push(tmpObject[tmpOptsCount]);
      window.TShirt.syncLayers();
      TShirt.canvas.renderAll();
      tmpOptsCount++;
    }
    /*
     svg moudle
     object for svg items, type: path-group
     path : path of svg image,
     options : svg options [""],
     canvas : canvas,
     type: "path-group"
    */
    function SVGItem(path, options, canvas) {
      this.path = path;
      this.options = {
        path: path,
        angle: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        fill: [],
        type: "path-group",
        scaleX: 0,
        scaleY: 0,
        svgname: ""
      };
      Object.defineProperties(this, {
        canvas: {
          get: function () {
            return canvas;
          }
        }
      });
      this.angle = 0;
      this.width = 0;
      this.height = 0;
      this.top = 0;
      this.left = 0;
      this.fill = [];
      this.type = "path-group";
      this.pCanvas = canvas;
      this.elem = null;
      tmpObject.push(this);
      // load svg image, call svg SetSvgObjectElem  func async
      fabric.loadSVGFromURL(path, function (objects, options) {
        var loaded = fabric.util.groupSVGElements(objects, options);
        loaded.originX = "center";
        loaded.originY = "center";
        loaded.top = canvas.height / 2;
        loaded.left = canvas.width / 2;
        var width = loaded.width;
        var height = loaded.height;
        // set width and height
        if (width > height && width > canvas.width) {
          var rate = height / width;
          width = canvas.width;
          height = width * rate;
        }
        if (height > width && height > canvas.height) {
          var rate = width / height;
          height = canvas.height;
          width = width * rate;
        }
        if (height == width && (width >= canvas.width || height >= canvas.height)) {
          width = height = (canvas.width >= canvas.height) ? canvas.height : canvas.width;
        }
        loaded.scaleToWidth(width);
        loaded.scaleToHeight(height);
        loaded.lockUniScaling = true;
        loaded.lockScalingX = true;
        loaded.lockScalingY = true;
        tmpElem.push(loaded);
        canvas.add(loaded);
        canvas.renderAll();
        // call
        SetSvgObjectElem();
        canvas.renderAll();
      });
      this.asyncAtrributes = function () {
        this.elem.type = this.type;
        this.angle = this.elem.angle;
        this.options.angle = this.elem.angle;
        this.width = this.elem.width;
        this.options.width = this.elem.width;
        this.height = this.elem.height;
        this.options.height = this.elem.height;
        this.top = this.elem.top;
        this.options.top = this.elem.top;
        this.left = this.elem.left;
        this.options.left = this.elem.left;
        this.type = this.elem.type;
        this.options.type = this.elem.type;
        this.fill = this.elem.fill;
        this.options.fill = this.elem.fill;
        this.scaleX = this.elem.scaleX;
        this.options.scaleX = this.elem.scaleX;
        this.scaleY = this.elem.scaleY;
        this.options.scaleY = this.elem.scaleY;
      }
      //return items fill color/pattern array
      this.getFillColorArray = function () {
        var array = [];
        for (var k = 0; k < this.elem.paths.length; k++) {
          var cell = [];
          cell = this.elem.paths[k].fill;
          array.push(cell);
        }
        return array;
      }
      //set svg path id
      this.setPathsId = function () {
        for (var k = 0; k < this.elem.paths.length; k++) {
          this.elem.paths[k].id = k;
        }
      }
      //set svg fill color/pattern by id
      this.setFillColorByID = function (id, color) {
        this.fill[id] = color;
        this.elem.fill[id] = color;
        this.options.fill[id] = color;
        this.elem.paths[id].setFill(color);
        TShirt.canvas.renderAll();
      }
      //set svg fill color/pattern by array
      this.setFillColorByArray = function (array) {
        for (var k = 0; k < this.elem.paths.length; k++) {
          var color = array[k];
          if (typeof (color) == 'undefined') {
            color = "#000000";
          }
          this.setFillColorByID(k, color);
        }
      }
      //set svg options
      this.set = function (name, value) {
        if (name == "constrain") {
          window.TShirt.constrain = value;
          if (value == true) {
            this.rate = parseFloat(this.scaleX / this.scaleY);
          } else {
            this.rate = 0;
          }
          return;
        }
        if (name == "type") {
          this.options.type = value;
          this.elem.type = value;
          this.type = value;
        }
        if (name == "angle") {
          this.options.angle = parseFloat(value);
          this.elem.angle = parseFloat(value);
          this.angle = parseFloat(value);
        }
        if (name == "width") {
          name = "scaleX";
          value = parseFloat(value / this.options.width);
        }
        if (name == "height") {
          name = "scaleY";
          value = parseFloat(value / this.options.height);
        }
        if (name == "top") {
          this.options.top = parseFloat(value);
          this.elem.top = parseFloat(value);
          this.top = parseFloat(value);
        }
        if (name == "scaleX") {
          this.options.scaleX = parseFloat(value);
          this.elem.scaleX = parseFloat(value);
          this.scaleX = parseFloat(value);
        }
        if (name == "scaleY") {
          this.options.scaleY = parseFloat(value);
          this.elem.scaleY = parseFloat(value);
          this.scaleY = parseFloat(value);
        }
        if (name == "left") {
          this.options.left = parseFloat(value);
          this.elem.left = parseFloat(value);
          this.left = parseFloat(value);
        }
        if (name == "svgname") {
          this.options.svgname = value;
          this.svgname = value;
        }
        if (name == "fill") {
          this.setFillColorByArray(value);
          this.options.fill = value;
          this.elem.fill = value;
          this.fill = value;
        }
        canvas.renderAll();
      }
    }

    /*
      Draw cloths as image in product div canvas.
    */
    function setBackgroundImage(canvasWidth, canvasHeight, path, scale) {
      fabric.Image.fromURL(path, function (img) {
        // get image rate 
        var rate = img.width / img.height;
        img.height = parseInt(canvasHeight * scale);
        img.width = parseInt(img.height * rate);
        marginTop = parseInt((canvasHeight - img.height) / 2);
        marginLeft = parseInt((canvasWidth - img.width) / 2);
        canvas = window.TShirt.canvasBackGround;
        // set cloths as canvas background
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          top: marginTop + 40,
          left: marginLeft + 58,
          originX: 'left',
          originY: 'top',
          scaleX: scale,
          scaleY: scale
        });
        canvas.renderAll();
      });
    };
    /*
      Change Edit Panel displays by state
      state : string value about edit panel
      value : int value (flag)
    */
    function changeViewState(state, value) {
      var select_menu = $('.menu>.active>.selected').children('a').attr('class');
      $('.EditProductPane').attr('style', 'display:none');
      if (select_menu != 'addText') {
        $('.AddTextPane').attr('style', 'display:none');
        $('.EditTextPane').attr('style', 'display:none');
      }
      $('.AddImagePane').attr('style', 'display:none');
      $('.EditProductPane').attr('style', 'display:none');
      $('.EditImagePane').attr('style', 'display:none');

      if (state == "addText") {
        if (value == 0) {
          $('.EditTextPane').attr('style', '');
        } else if (value == 1) {
          $('.AddTextPane').attr('style', '');
        } else if (value == 2) {
          $('.AddTextPane').attr('style', '');
          $('.EditTextPane').attr('style', '');
        }
      }
      if (state == 'addLetter') {
        $('.EditTextPane').hide();
      };
      if (state == "editImage") {
        $('.transparent_background').show();
        $('.editimagepane_svg').hide();
        $('.pattern_container').hide();
        if (value == 0) {
          $('.EditImagePane').attr('style', '');
        } else {
          $('.AddImagePane').attr('style', '');
        }
      }
      if (state == "editSvg") {
        $('.transparent_background').hide();
        $('.editimagepane_svg').show();
        $('.pattern_container').show();
        if (value == 0) {
          $('.EditImagePane').attr('style', '');
        } else {
          $('.AddImagePane').attr('style', '');
        }
      }
      if (state == "editProduct") {
        $('.EditProductPane').attr('style', '');
        ChangeCanvasEnableState("hideline");
      }
    }

    /*
    set product divs state
    draw red lines and show/hide ....
    name : string, sub-canvas name
    */
    function ChangeCanvasEnableState(name) {

      $('#RecUpLeft').attr('class', 'hide hideline');
      $('#RecUpRight').attr('class', 'hide hideline');
      $('#RecLeft').attr('class', 'hide hideline');
      $('#RecBack').attr('class', 'hide hideline');
      $('#RecRight').attr('class', 'hide hideline');

      if (lastProductCanvasName != name && lastProductCanvasName != "hideline") {
        if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
          window.TShirt.canvasProduct.deactivateAll().renderAll();
        }
      }
      lastProductCanvasName = name;
      if (name == "stageUpLeft") {
        $('#RecUpLeft').attr('class', 'enable');
        $('#RecUpRight').attr('class', 'disable');
        window.TShirt.canvasProduct = window.TShirt.canvasUpLeft;
      } else if (name == "stageUpRight") {
        $('#RecUpLeft').attr('class', 'disable');
        $('#RecUpRight').attr('class', 'enable');
        window.TShirt.canvasProduct = window.TShirt.canvasUpRight;
      } else if (name == "stageLeft") {
        $('#RecLeft').attr('class', 'enable');
        window.TShirt.canvasProduct = window.TShirt.canvasLeft;
      } else if (name == "stageBack") {
        $('#RecBack').attr('class', 'enable');
        window.TShirt.canvasProduct = window.TShirt.canvasBack;
      } else if (name == "stageRight") {
        $('#RecRight').attr('class', 'enable');
        window.TShirt.canvasProduct = window.TShirt.canvasRight;
      } else if (name == "hideline") {
        window.TShirt.canvasProduct.renderAll();
        if (window.TShirt.view_direction == 1) {
          $('#RecUpLeft').attr('class', 'hideline');
          $('#RecUpRight').attr('class', 'hideline');
        }
        if (window.TShirt.view_direction == 2) {
          $('#RecLeft').attr('class', 'hideline');
        }
        if (window.TShirt.view_direction == 3) {
          $('#RecBack').attr('class', 'hideline');
        }
        if (window.TShirt.view_direction == 4) {
          $('#RecRight').attr('class', 'hideline');
        }
      }
    }
    /*
    set product divs view state
    show/hide sub-canvas
    direction : int, product direction value
    */
    function ChangeCanvasRectViewState(direction) {

      $('#RecUpLeft').attr('class', 'hide disable');
      $('#RecUpRight').attr('class', 'hide disable');
      $('#RecLeft').attr('class', 'hide disable');
      $('#RecBack').attr('class', 'hide disable');
      $('#RecRight').attr('class', 'hide disable');

      if (direction == "front") {
        $('#RecUpLeft').attr('class', 'disable');
        $('#RecUpRight').attr('class', 'disable');
      } else if (direction == "left") {
        $('#RecLeft').attr('class', 'disable');
      } else if (direction == "back") {
        $('#RecBack').attr('class', 'disable');
      } else if (direction == "right") {
        $('#RecRight').attr('class', 'disable');
      }
    }
    /*
    swap product items layer
    flag : string, bringup/bringdown
    item : object
    items : objects
    */
    function SwapItems(flag, item, items) {
      var index = items.indexOf(item);
      if (flag == "BringUp") {
        if (index != 2) {
          var tmp = items[index + 1];
          items[index + 1] = items[index];
          items[index] = tmp;
        }
      } else {
        if (index != 0) {
          var tmp = items[index - 1];
          items[index - 1] = items[index];
          items[index] = tmp;
        }
      }

    }
    /*
    return canvas objects as json 
    canvas : canvas
    */
    function GetJsonFromCanvas(canvas) {
      var ArrayObject = [];
      for (var k = 0; k < canvas.getObjects().length; k++) {
        // loops and get canvas's object
        enableItem = TShirt.items.filter(function (item) {
          return item.elem == canvas.item(k);
        })[0];
        var strBuf = "";
        if (enableItem != null) {
          // get type and process specify options
          if (enableItem.options.type == "path-group") {
            for (var i = 0; i < enableItem.elem.fill.length; i++) {
              if (typeof (enableItem.elem.fill[i]) != 'string') {
                enableItem.options.fill[i] = enableItem.elem.fill[i].source.currentSrc;
              }
            }
          }
          if (enableItem.type == "text") {
            if (enableItem.options.drawingStyle == "Vertical") {
              strBuf = enableItem.elem.text.split("\n").join("");
            }
          }
          tmp = enableItem.options;
          if (strBuf != "") {
            tmp.text = strBuf;
          } else {
            tmp.text = enableItem.elem.text;
          }
          tmp.text = enableItem.elem.text;
          tmp.top = enableItem.elem.top;
          tmp.left = enableItem.elem.left;
          tmp.type = enableItem.type;
          ArrayObject.push(tmp);
        }
      }
      if (ArrayObject.length != 0) {
        return JSON.stringify(ArrayObject);
      } else {
        return "";
      }
    }
    /*
    get html text from canvas objects
    */
    function GetHtmlElementFromTextObjects(others) {
      var TextString = [];
      var HtmlString = "";
      if (others == "Front Left") {
        for (var k = 0; k < TShirt.canvasUpLeft.getObjects().length; k++) {
          var obj = TShirt.canvasUpLeft.getObjects()[k];
          if (typeof (obj.text) != 'undefined' && obj.text.length != 0) {
            TextString.push(obj.text);
          }
        }
      } else if (others == "Front Right") {
        for (var k = 0; k < TShirt.canvasUpRight.getObjects().length; k++) {
          var obj = TShirt.canvasUpRight.getObjects()[k];
          if (typeof (obj.text) != 'undefined' && obj.text.length != 0) {
            TextString.push(obj.text);
          }
        }
      } else if (others == "Left") {
        for (var k = 0; k < TShirt.canvasLeft.getObjects().length; k++) {
          var obj = TShirt.canvasLeft.getObjects()[k];
          if (typeof (obj.text) != 'undefined' && obj.text.length != 0) {
            TextString.push(obj.text);
          }
        }
      } else if (others == "Back") {
        for (var k = 0; k < TShirt.canvasBack.getObjects().length; k++) {
          var obj = TShirt.canvasBack.getObjects()[k];
          if (typeof (obj.text) != 'undefined' && obj.text.length != 0) {
            TextString.push(obj.text);
          }
        }
      } else if (others == "Right") {
        for (var k = 0; k < TShirt.canvasRight.getObjects().length; k++) {
          var obj = TShirt.canvasRight.getObjects()[k];
          if (typeof (obj.text) != 'undefined' && obj.text.length != 0) {
            TextString.push(obj.text);
          }
        }
      }
      for (var k = 0; k < TextString.length; k++) {
        TShirt.allPrice += parseInt(TShirt.prices.text);
        HtmlString += "<tr><td> Text </td><td>" + TextString[k] + "</td><td>" + TShirt.prices.text + "</td><td>" + others + "</td></tr>";
      }
      return HtmlString;
    }
    /*
    return html tag string from json, using for price
    json : json buffer
    others : set positon name for product ex: Front Left/Back
    */
    function GetHtmlElementFromJson(json, others) {
      var ArrayOptions = [];
      var HtmlString = "";
      var price = 0;
      var LetterString = [];
      var AddedTextString = [];
      var ImageString = [];
      var SvgString = [];


      if (json != '' && typeof (json) !== undefined) {
        ArrayOptions = JSON.parse(json);

        for (var k = 0; k < ArrayOptions.length; k++) {
          var opts = ArrayOptions[k];
          if (opts.type == "text" || opts.type == "curve") {
            if (typeof (opts.letter_id) != 'undefined') {
              LetterString[opts.letter_id - 1] = opts.text;
            } else {
              AddedTextString.push(opts.text);
            }
          }
          if (opts.type == "image") {
            ImageString.push(opts.imgname);
          }
          if (opts.type == "path-group") {
            SvgString.push(opts.svgname);
          }
        }

        var strLetter = "";
        for (var k = 0; k < LetterString.length; k++) {
          strLetter += LetterString[k];
        }

        if (strLetter != "") {
          TShirt.allPrice += parseInt(TShirt.prices.letter);
          HtmlString = "<tr><td> Letter Patch </td><td>" + strLetter + "</td><td>" + TShirt.prices.letter + "</td><td>" + others + "</td></tr>";
        }
        for (var k = 0; k < AddedTextString.length; k++) {
          TShirt.allPrice += parseInt(TShirt.prices.addedtext);
          HtmlString += "<tr><td> Added Text </td><td>" + AddedTextString[k] + "</td><td>" + TShirt.prices.addedtext + "</td><td>" + others + "</td></tr>";
        }
        for (var k = 0; k < ImageString.length; k++) {
          TShirt.allPrice += parseInt(TShirt.prices.image);
          HtmlString += "<tr><td> Added Image </td><td>" + ImageString[k] + "</td><td>" + TShirt.prices.image + "</td><td>" + others + "</td></tr>";
        }
        for (var k = 0; k < SvgString.length; k++) {
          TShirt.allPrice += parseInt(TShirt.prices.svg);
          HtmlString += "<tr><td> Added Svg </td><td>" + SvgString[k] + "</td><td>" + TShirt.prices.svg + "</td><td>" + others + "</td></tr>";
        }
      }
      return HtmlString;
    }
    /*
    return set canvas objects from json
    json : json buffer
    canvas : target canvas
    */
    function GetCanvasObjectFromJson(json, canvas) {
      if (json != "") {
        Json2Element(json, canvas, true);
        if (canvas._activeObject != null || canvas._activeGroup != null) {
          canvas.deactivateAll().renderAll();
        }
      }
    }
    /*
    return set canvas objects from json
    json : json buffer
    canvas : target canvas
    */
    function Json2Element(json, canvas) {
      var ArrayOptions = [];

      tmpElem = [];
      tmpObject = [];
      tmpOptsCount = 0;
      tmpOpts = [];

      if (json != '' && typeof json !== undefined) {
        ArrayOptions = JSON.parse(json);
        for (var k = 0; k < ArrayOptions.length; k++) {
          var opts = ArrayOptions[k];
          if (opts.type == "text" || opts.type == "curve") {
            var options = TextItem.defaultOptions;
            var item = null;
            item = new TextItem(opts.text, options, canvas);
            item.ensureTextPosition();
            window.TShirt.items.push(item);
            window.TShirt.syncLayers();
            item.activate();
            item.savePosition();
            item.set('angle', opts.angle);
            item.set('fontFamily', opts.fontFamily);
            item.set('fontSize', opts.fontSize);
            item.set('fill', opts.fill);
            item.set('drawingStyle', opts.drawingStyle);
            item.set('curveDegree', opts.curveDegree);
            item.set('curveBridge', opts.curveBridge);
            item.set('borderStyle', opts.borderStyle);
            item.set('borderColor', opts.borderColor);
            item.set('borderWidth', opts.borderWidth);
            item.set('innerBorderStyle', opts.innerBorderStyle);
            item.set('innerBorderColor', opts.innerBorderColor);
            item.set('innerBorderWidth', opts.innerBorderWidth);
            item.set('italic', opts.italic);
            item.set('bold', opts.bold);
            item.set('underline', opts.underline);
            item.set('textHAlign', opts.textHAlign);
            item.set('textVAlign', opts.textVAlign);
            item.set('top', opts.top);
            item.set('left', opts.left);
            item.set('text', opts.text);
            item.set('letter_id', opts.letter_id);
            item.set('spacing', opts.spacing);
            item.set('lineHeight', parseFloat(opts.lineHeight));
            // specify process of letters
            if (opts.letter_id == 1) {
              canvas.sendToBack(item.elem);
              $letter_text1.val(opts.text);
            }
            if (opts.letter_id == 2) {
              canvas.sendToBack(item.elem);
              $letter_text2.val(opts.text);
            }
            if (opts.letter_id == 3) {
              canvas.sendToBack(item.elem);
              $letter_text3.val(opts.text);
            }
            item.top = opts.top;
            item.left = opts.left;
            
          }
          // specify process of image
          if (opts.type == "image") {
            var options = "";
            item = new ImageItem(opts.data, options, canvas);
            item.set("top", opts.top);
            item.set("left", opts.left);
            item.set("angle", opts.angle);
            item.set("width", opts.width);
            item.set("height", opts.height);
            item.set("removeWhite", opts.removeWhite);
            item.set("imgname", opts.imgname);
            item.set("scaleX", 1);
            item.set("scaleY", 1);

            if (window.TShirt.constrain == true) {
              item.rate = opts.width / opts.height;
            } else {
              item.rate = 0;
            }
            item.options.data = opts.data;
            window.TShirt.items.push(item);
          }
          // specify process of svg
          if (opts.type == "path-group") {
            tmpOpts.push(opts);
            var item = new SVGItem(opts.path, "", canvas);
          }
          window.TShirt.syncLayers();
        }
        canvas.renderAll();
      }
    }

    // $(function () {
    "use strict";
    fabric.Object.prototype.transparentCorners = true;
    fabric.CurvedText.prototype.remove = fabric.Text.prototype.remove;
    fabric.CurvedText.prototype.renderOnAddRemove = false;
    fabric.CurvedText.prototype.originX = "center";
    fabric.CurvedText.prototype.originY = "center";
    fabric.Text.prototype.lockUniScaling = true;
    fabric.Image.prototype.originX = "center";
    fabric.Image.prototype.originY = "center";
    fabric.Image.prototype.lockUniScaling = true;
    fabric.Text.prototype._reNewline = /(?!.*)/;
    //Redefined _chooseObjectsToRender function (it majes active items render in their order (not on the top))
    fabric.Canvas.prototype._chooseObjectsToRender = function () {
      return this._objects;
    };
    fabric.Text.prototype._oldRender = fabric.Text.prototype._render;
    //Redefined _render function to add functionality of Bridge text
    fabric.Text.prototype._render = function (ctx) {
      var w = ctx.canvas.width,
        h = ctx.canvas.height;
      ctx.clearRect(0, 0, w, h);
      this._oldRender(ctx);
      if (!this.designOptions) {
        return;
      }
      if (this.designOptions.drawingStyle == "Bridge text") {
        var $source = $("<canvas>"),
          sourceCtx = $source[0].getContext("2d");
        $source[0].width = w;
        $source[0].height = h;
        var curve = this.designOptions.curveBridge,
          textHeight = this.height,
          textWidth = this.width,
          textTop = h / 2 - textHeight / 2,
          textLeft = w / 2 - textWidth / 2,
          dltY = curve / textHeight,
          angleSteps = 180 / textWidth,
          y = 0,
          i = 0;
        while (i++ <= textWidth) {
          y = textHeight * (1 - (curve / 100) * Math.sin(i * angleSteps * Math.PI / 180));
          sourceCtx.drawImage(
            ctx.canvas,
            i + textLeft, textTop, 1, textHeight,
            i + textLeft, textTop, 1, (textHeight + y) / 2 //textHeight * Math.abs((textWidth / 2 - i) / textWidth)
          );
        }
        ctx.drawImage($source[0], 0, 0);
        this._bridgeCanvas = $source[0];
      }
    };
    //Redefined _renderText function to add functionality of Inner and Outer stroke
    fabric.Text.prototype._renderText = function (ctx) {
      if (this.group) {
        this.innerStroke = this.group.innerStroke;
        this.innerStrokeWidth = this.group.innerStrokeWidth;
        this.innerStrokeDashArray = this.group.innerStrokeDashArray;
        this.stroke = this.group.stroke;
        this.strokeWidth = this.group.strokeWidth;
        this.strokeDashArray = this.group.strokeDashArray;
        this.strokeLineJoin = this.group.strokeLineJoin;
        this.strokeLineCap = this.group.strokeLineCap;
      }
      if (this.innerStroke && this.innerStrokeWidth) {
        if (this.stroke && this.strokeWidth) {
          this._renderInnerTextStroke(ctx);
        } else {
          this._renderInnerTextStrokeOnly(ctx);
        }
      } else {
        if (this.stroke && this.strokeWidth) {
          ctx.save();
          this._setLineDash(ctx, this.strokeDashArray);
          this._renderTextStroke(ctx);
          ctx.restore();
        }
        this._renderTextFill(ctx);
      }
    };
    //Redefined drawCacheOnCanvas function to draw Bridge text
    fabric.Text.prototype.drawCacheOnCanvas = function (ctx) {
      ctx.scale(1 / this.zoomX, 1 / this.zoomY);
      if (this.designOptions && this.designOptions.drawingStyle == "Bridge text") {
        ctx.drawImage(this._bridgeCanvas, -this.cacheTranslationX, -this.cacheTranslationY);
      } else {
        ctx.drawImage(this._cacheCanvas, -this.cacheTranslationX, -this.cacheTranslationY);
      }
    };
    //Redefined _renderTextStroke (Removed some unneccessary stuff)
    fabric.Text.prototype._renderTextStroke = function (ctx) {
      if (this.shadow && !this.shadow.affectStroke) {
        this._removeShadow(ctx);
      }
      ctx.beginPath();
      this._renderTextCommon(ctx, 'strokeText');
      ctx.closePath();
    };
    //Added _renderInnerTextStroke (Draws inner stroke and outer stroke)
    fabric.Text.prototype._renderInnerTextStroke = function (ctx) {
      var stroke = this.stroke,
        strokeWidth = this.strokeWidth;
      ctx.save();
      ctx.beginPath();
      ctx.lineJoin = this.strokeLineJoin;
      ctx.lineCap = this.strokeLineCap;
      ctx.setLineDash(this.innerStrokeDashArray || []);
      ctx.strokeStyle = this.stroke = this.innerStroke;
      ctx.lineWidth = this.strokeWidth = this.innerStrokeWidth;
      this._renderTextFill(ctx);
      ctx.globalCompositeOperation = "source-atop";
      this._renderTextStroke(ctx);
      ctx.globalCompositeOperation = "destination-over";
      ctx.setLineDash(this.strokeDashArray || []);
      ctx.strokeStyle = this.stroke = stroke;
      ctx.lineWidth = this.strokeWidth = strokeWidth;
      this._renderTextStroke(ctx);
      ctx.globalCompositeOperation = "source-over";
      ctx.closePath();
      ctx.restore();
    };
    //Added _renderInnerTextStroke (Draws inner stroke)
    fabric.Text.prototype._renderInnerTextStrokeOnly = function (ctx) {
      var stroke = this.stroke,
        strokeWidth = this.strokeWidth;
      ctx.save();
      if (this.innerStrokeDashArray) {
        ctx.setLineDash(this.innerStrokeDashArray);
      }
      ctx.strokeStyle = this.stroke = this.innerStroke;
      ctx.lineWidth = this.strokeWidth = this.innerStrokeWidth;
      this._renderTextFill(ctx);
      ctx.globalCompositeOperation = "source-atop";
      this._renderTextStroke(ctx);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
      this.stroke = stroke;
      this.strokeWidth = strokeWidth;
    };
    //Redefined _initDimensions (Synchronizes textbox size with it's bounds)
    fabric.Textbox.prototype._initDimensions = function (ctx) {
      if (this.__skipDimension) {
        return;
      }
      if (!ctx) {
        ctx = fabric.util.createCanvasElement().getContext('2d');
        this._setTextStyles(ctx);
        this.clearContextTop();
      }
      // clear dynamicMinWidth as it will be different after we re-wrap line
      this.dynamicMinWidth = 0;
      // wrap lines
      this._textLines = this._splitTextIntoLines(ctx);
      // if after wrapping, the width is not equal than dynamicMinWidth, change the width and re-wrap
      if (this.dynamicMinWidth != this.width) {
        this._set('width', this.dynamicMinWidth);
      }
      // clear cache and re-calculate height
      this._clearCache();
      this.height = this._getTextHeight(ctx);
    };
    //Redefined _wrapLine (Doesn't allow new lines in single textbox)
    fabric.Textbox.prototype._wrapLine = function (ctx, text, lineIndex) {

        var lineWidth = 0,
          lines = [],
          line = '',
          words = '',
          word = '',
          offset = 0,
          infix = ' ',
          wordWidth = 0,
          infixWidth = 0,
          largestWordWidth = 0,
          lineJustStarted = true,
          additionalSpace = this._getWidthOfCharSpacing();
        if (!this.designOptions) {
          this.designOptions = $.extend(true, {}, TextItem.defaultOptions, this.options);
          words = [text];
        } else {
          words = this.designOptions.drawingStyle == "Vertical" ? text.split(" ") : [text];
        }

        for (var i = 0; i < words.length; i++) {
          word = words[i];
          wordWidth = this._measureText(ctx, word, lineIndex, offset);
          offset += word.length;
          lineWidth += infixWidth + wordWidth - additionalSpace;
          if (lineWidth >= this.width && !lineJustStarted) {
            lines.push(line);
            line = '';
            lineWidth = wordWidth;
            lineJustStarted = true;
          } else {
            lineWidth += additionalSpace;
          }
          if (!lineJustStarted) {
            line += infix;
          }
          line += word;
          infixWidth = this._measureText(ctx, infix, lineIndex, offset);
          offset++;
          lineJustStarted = false;
          // keep track of largest word
          if (wordWidth > largestWordWidth) {
            largestWordWidth = wordWidth;
          }
        }
        i && lines.push(line);
        if (largestWordWidth > this.dynamicMinWidth) {
          this.dynamicMinWidth = largestWordWidth - additionalSpace;
        }
        return lines;
      },
      //Selects an element by it's name'
      $.byName = function (name) {
        return $("[name='" + name + "']");
      };
    //Returns true if rectangles intersect, otherwise returns false 
    $.rectsIntersect = function (rect1, rect2) {
      if (
        rect1.top < rect2.top + rect2.height &&
        rect1.top + rect1.height > rect2.top &&
        rect1.left < rect2.left + rect2.width &&
        rect1.left + rect1.width > rect2.left
      ) {
        return true;
      }
      return false;
    };
    //Default options for TextItem class
    TextItem.defaultOptions = {
      fontFamily: "Tahoma",
      fontSize: 20,
      fill: "#000000",
      angle: 0,
      drawingStyle: "Straight",
      curveDegree: 0,
      curveBridge: 0,
      borderStyle: "none",
      borderColor: "#000000",
      borderWidth: 1,
      innerBorderStyle: "none",
      innerBorderColor: "#000000",
      innerBorderWidth: 1,
      italic: false,
      bold: false,
      underline: false,
      textHAlign: "center",
      textVAlign: "center",
      spacing: 5,
      lineHeight: 0.8
    };
    //jQuery elements (inputs, buttons, etc.)
    var $addText = $.byName("addText"),
      $calculator = $.byName("calculator"),
      $text = $.byName("text"),
      $fontFamily = $.byName("fontFamily").val(TextItem.defaultOptions.fontFamily),
      $fontSize = $.byName("fontSize").val(TextItem.defaultOptions.fontSize),
      $fontSizeNum = $.byName('fontSizeNum').val($fontSize.val()),
      $fill = $.byName("fill").val(TextItem.defaultOptions.fill),
      $angle = $.byName("angle").val(TextItem.defaultOptions.angle),
      $angleNum = $.byName("angleNum").val($angle.val()),
      $drawingStyle = $.byName("drawingStyle").val(TextItem.defaultOptions.drawingStyle),
      $curveDegree = $.byName("curveDegree").val(TextItem.defaultOptions.curveDegree),
      $curveValue = $.byName("curveValue").val(TextItem.defaultOptions.curveDegree),
      $curveBridge = $.byName("curveBridge").val(TextItem.defaultOptions.curveBridge),
      $brigeValue = $.byName("brigeValue").val(TextItem.defaultOptions.curveBridge),
      $borderStyle = $.byName("borderStyle").val(TextItem.defaultOptions.borderStyle),
      $borderColor = $.byName("borderColor").val(TextItem.defaultOptions.borderColor),
      $borderWidth = $.byName("borderWidth").val(TextItem.defaultOptions.borderWidth),
      $innerBorderStyle = $.byName("innerBorderStyle").val(TextItem.defaultOptions.innerBorderStyle),
      $innerBorderColor = $.byName("innerBorderColor").val(TextItem.defaultOptions.innerBorderColor),
      $innerBorderWidth = $.byName("innerBorderWidth").val(TextItem.defaultOptions.innerBorderWidth),
      $fontStyle = $.byName("fontStyle").val(TextItem.defaultOptions.fontStyle),
      $textHAlign = $.byName("textHAlign").val(TextItem.defaultOptions.textHAlign),
      $textVAlign = $.byName("textVAlign").val(TextItem.defaultOptions.textVAlign),
      $italic = $.byName("italic"),
      $bold = $.byName("bold"),
      $underline = $.byName("underline"),
      $overlap = $.byName("overlap").prop("checked", true),
      $constrain = $.byName("constrain").prop("checked", true),
      $btnAdd = $("#btnAddText"),
      $btnDelete = $("#deleteText"),
      $btnUp = $.byName("BringUp"),
      $btnDown = $.byName("BringDown"),
      $widthInput = $.byName("widthInput").val(0),
      $widthInputNum = $.byName("widthInputNum").val($widthInput.val()),
      $heightInput = $.byName("heightInput").val(0),
      $heightInputNum = $.byName("heightInputNum").val($heightInput.val()),
      $spaceSize = $.byName("spaceSize").val(0),
      $spaceSizeNum = $.byName("spaceSizeNum").val($spaceSize.val()),
      $lineSpacingSize = $.byName("lineSpacingSize").val(1),
      $lineSpacingSizeNum = $.byName("lineSpacingSizeNum").val($lineSpacingSize.val()),
      $removewhite = $.byName('removewhitecolor').prop("checked", false),
      $productSize = $.byName('product-Size').val(1),
      $productSizeNum = $.byName('product-SizeNum').val(1),
      $productSizeTag = $("#product_size"),
      $pattern_container = $("#pattern_container"),
      $preloader = $.byName('preloader'),

      $letter_borderStyle = $.byName("letter-borderStyle").val(TextItem.defaultOptions.borderStyle),
      $letter_borderColor = $.byName("letter-borderColor").val(TextItem.defaultOptions.borderColor),
      $letter_borderWidth = $.byName("letter-borderWidth").val(TextItem.defaultOptions.borderWidth),
      $letter_innerBorderStyle = $.byName("letter-innerBorderStyle").val(TextItem.defaultOptions.innerBorderStyle),
      $letter_innerBorderColor = $.byName("letter-innerBorderColor").val(TextItem.defaultOptions.innerBorderColor),
      $letter_innerBorderWidth = $.byName("letter-innerBorderWidth").val(TextItem.defaultOptions.innerBorderWidth),
      $layers = $("#layers").sortable().disableSelection();
    $layers = $.byName("layers").sortable().disableSelection();
    $alignCenter = $.byName("alignCenter");
    $productSizeTag.hide();
    var tmpElem = [];
    var tmpObject = [];
    var tmpOpts = [];
    var tmpOptsCount = 0;
    /*
    return image json data by window.TShirt.view_direction
    */
    function GetLinkProductCanvasToImage() {

      if (window.TShirt.canvasBackGround._activeObject != null || window.TShirt.canvasBackGround._activeGroup != null) {
        window.TShirt.canvasBackGround.deactivateAll().renderAll();
      }
      if (window.TShirt.canvasUpLeft._activeObject != null || window.TShirt.canvasUpLeft._activeGroup != null) {
        window.TShirt.canvasUpLeft.deactivateAll().renderAll();
      }
      if (window.TShirt.canvasUpRight._activeObject != null || window.TShirt.canvasUpRight._activeGroup != null) {
        window.TShirt.canvasUpRight.deactivateAll().renderAll();
      }
      if (window.TShirt.canvasLeft._activeObject != null || window.TShirt.canvasLeft._activeGroup != null) {
        window.TShirt.canvasLeft.deactivateAll().renderAll();
      }
      if (window.TShirt.canvasRight._activeObject != null || window.TShirt.canvasRight._activeGroup != null) {
        window.TShirt.canvasRight.deactivateAll().renderAll();
      }
      if (window.TShirt.canvasBack._activeObject != null || window.TShirt.canvasBack._activeGroup != null) {
        window.TShirt.canvasBack.deactivateAll().renderAll();
      }

      var bottomCanvas = document.getElementById('stageBackground');
      var frontLeftCanvas = document.getElementById('stageUpLeft');
      var frontRightCanvas = document.getElementById('stageUpRight');
      var LeftCanvas = document.getElementById('stageLeft');
      var BackCanvas = document.getElementById('stageBack');
      var RightCanvas = document.getElementById('stageRight');
      var bottomContext = bottomCanvas.getContext('2d');
      if (window.TShirt.view_direction == 1) {
        bottomContext.drawImage(frontLeftCanvas, 180, 180);
        bottomContext.drawImage(frontRightCanvas, 285, 180);
      }
      if (window.TShirt.view_direction == 2) {
        bottomContext.drawImage(LeftCanvas, 210, 180);
      }
      if (window.TShirt.view_direction == 3) {
        bottomContext.drawImage(BackCanvas, 205, 175);
      }
      if (window.TShirt.view_direction == 4) {
        bottomContext.drawImage(RightCanvas, 280, 180);
      }

      return bottomCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    }





    $(function () {
      TShirt.init();
    });
    /*
      change product divs view state by view_direction
    */
    function changeImage(view_direction) {
      var path;
      // changeViewState('addText',1);
      if (view_direction == 1) {
        path = "assets/images/front.jpg";
        ChangeCanvasRectViewState('front');
      } else if (view_direction == 2) {
        path = "assets/images/left.jpg";
        ChangeCanvasRectViewState('left');
      } else if (view_direction == 3) {
        path = "assets/images/back.jpg";
        ChangeCanvasRectViewState('back');
      } else if (view_direction == 4) {
        path = "assets/images/right.jpg";
        ChangeCanvasRectViewState('right');
      }
      return path;
    }

    /*
      change product views state, disabled
    */

    var lastZoomVal = 0;
    // set zoom size of product active item
    $('#ZoomSize').on('change input', function () {
      var zoomVal = $('#ZoomSize').val();

      for (var k = 0; k < window.TShirt.canvas.getObjects().length; k++) {
        var size = window.TShirt.canvas.getObjects()[k].fontSize;
        var zoomsize = parseInt(size) + parseInt(zoomVal) - parseInt(lastZoomVal);
        if (zoomsize < 0) {
          zoomsize = 0;
        }
        activeItem = TShirt.items.filter(function (item) {
          return item.elem == window.TShirt.canvas.getObjects()[k];
        })[0];
        activeItem.set('fontSize', parseInt(zoomsize));
      }
      lastZoomVal = zoomVal;
    });
    //when user click menu tab ,it will execute.
    $('.menu>.active>li').click(function () {
      console.log("select_menu click");
      var select_menu = $(this).children('a').attr('class');
      var parent = $('.content .panes');
      if ($(this).hasClass('selected')) {
        return;
      }
      TShirt.canvasProduct.deactivateAll().renderAll();
      if (select_menu == 'saveDesign') {
        parent.children('.SaveDesignPane').show();
        parent.children().not('.SaveDesignPane ').hide();
        $('.EditPricePane').hide();
        // ChangeCanvasEnableState('hideline');
        $(this).addClass('selected');
        // $('.saveButton').attr('download','download.png');
        // $('.saveButton').attr('href',GetLinkProductCanvasToImage());
        $('#saveBuffer').hide();
        $('.menu>.active>li').not(this).removeClass('selected');
        window.TShirt.canvasBackGround.renderAll();
      }
      if (select_menu == 'editProduct') {
        ResetTextPatch();
        window.TShirt.clearDesignPanel();
        $('.collapse-list li').show();
        $('.SaveDesignPane').hide();
        $('.EditPricePane').hide();
        $(this).addClass('selected');
        $('.menu>.active>li').not(this).removeClass('selected');
        parent.children('.SaveDesignPane').hide();
        $('.DesignCanvas').show();
        $('.collapse-list').show();
        $('#letter_tab').show();
        $('.add-text-btn-position').hide();
        $('.AddTextPane').hide();
        $('.EditTextPane').hide();
        $('.layer-order').show();
        $('.layer-orders').show();
        $('.letter_panel').attr('style', '');
        $('.palette-color-picker-button').css('background', 'background:black none repeat scroll 0% 0%');
        $('#letter_text_panel').attr('style', 'border-top-left-radius: 5px;');
        $('#letter_image_panel').attr('style', 'border-top-right-radius: 5px;');
      }
      if (select_menu == 'addText') {
        window.TShirt.clearDesignPanel();
        ResetTextPatch();
        ResetLetterPatch();
        $(this).addClass('selected');
        $('.collapse-list').show();
        $('.menu>.active>li').not(this).removeClass('selected');
        $('.collapse-list li').eq(0).hide();
        $('.collapse-list li').eq(1).show();
        TShirt.clearDesignControlPanel();
        $('#letter_tab').hide();
        $('.DesignCanvas').hide();
        $('.SaveDesignPane').hide();
        $('.EditPricePane').hide();
        $('.palette-color-picker-button').css('background', 'background:black none repeat scroll 0% 0%');
        $('.AddTextPane').show();
        $('.EditTextPane').show();
        $('.layer-order').hide();
        $('.layer-orders').hide();
        $('.add-text-btn-position').hide();
        $('.AddTextPane').attr('style', 'padding-left:6px');
        $('.letter_panel').attr('style', 'height: 1035px; border-top: 1px solid #959595');
        $('#letter_image_panel').hide();
        $('#letter_text_panel').addClass('selected');
        $('#letter_text_panel').attr('style', 'width: 568px !important; border-top-left-radius: 5px;border-right: 1px solid #959595;border-top-right-radius: 5px;');
        // $('.AddText-collapse').click();
        $('#txtDel').val("");
      }

      if (select_menu == 'addImage') {
        window.TShirt.clearDesignPanel();
        $(this).addClass('selected');
        $('.collapse-list').show();
        $('.menu>.active>li').not(this).removeClass('selected');
        $('.collapse-list li').eq(0).hide();
        $('.collapse-list li').eq(1).show();
        // $('.collapse-list li').eq(2).children('a').hide();
        TShirt.clearDesignControlPanel();
        $('.DesignCanvas').show();
        $('#letter_tab').show();
        $('.EditPricePane').hide();
        $('.SaveDesignPane').hide();
        $('.AddImagePane').show();
        $('.layer-order').show();
        $('.layer-orders').show();
        $('.add-text-btn-position').hide();
        $('.letter_panel').attr('style', 'height: 655px;');
        $('#letter_text_panel').hide();
        $('.letter_menu').removeClass('selected');
        $('#letter_image_panel').addClass('selected');
        $('#letter_image_panel').attr('style', 'width:568px !important; border-top-left-radius:5px');
      }

      if (select_menu == 'buyLink') {
        window.TShirt.clearDesignPanel();
        $(this).addClass('selected');
        $('.collapse-list').show();
        $('.menu>.active>li').not(this).removeClass('selected');
        $('.collapse-list li').eq(0).hide();
        $('.collapse-list li').eq(1).hide();
        // $('.collapse-list li').eq(2).children('a').hide();
        TShirt.clearDesignControlPanel();
        $('.DesignCanvas').hide();
        $('.SaveDesignPane').hide();
        $('.add-text-btn-position').hide();
        $('.buyLink').attr('style', 'color:white');
        $('.EditPricePane').show();
        $('.layer-order').show();
        $('.layer-orders').show();
        $('.price_menu').removeClass('selected');
        if (window.TShirt.view_direction == 1) {
          $('#front_price').addClass('selected');
          TShirt.calculatePrice('front');
        } else if (window.TShirt.view_direction == 2) {
          $('#left_price').addClass('selected');
          TShirt.calculatePrice('left');
        } else if (window.TShirt.view_direction == 3) {
          $('#back_price').addClass('selected');
          TShirt.calculatePrice('back');
        } else if (window.TShirt.view_direction == 4) {
          $('#right_price').addClass('selected');
          TShirt.calculatePrice('right');
        }


      } else {
        $('.buyLink').attr('style', 'color:white');
      }

      $('.Letter-collapse').addClass('active-patch');
      // body...
    });
    // edit panels state for letter patch
    function showProductDiv(divname) {
      if (divname == "LetterPatch") {
        $('.collapse-list li').show();
        $('.SaveDesignPane').hide();
        $('.EditPricePane').hide();
        $('.menu>.active>li').removeClass('selected');
        $('.editProduct').parent().addClass('selected');
        $('.content .panes').children('.SaveDesignPane').hide();
        $('.DesignCanvas').show();
        $('.collapse-list').show();
        $('.letter_panel').attr('style', '');
        $('.palette-color-picker-button').css('background', 'background:black none repeat scroll 0% 0%');
        $('#letter_text_panel').attr('style', 'border-top-left-radius: 5px;');
        $('#letter_image_panel').attr('style', 'border-top-right-radius: 5px;');
        $('#letter_tab').show();
        $(this).addClass('selected');
        $('.add-text-btn-position').hide();
        $('.AddTextPane').hide();
        $('.EditTextPane').hide();
        $('.layer-order').show();
        $('.layer-orders').show();
      }

    }
    /*
      change product views
    */
    $('#RecUpLeft').on('click', function () {
      ChangeCanvasEnableState("stageUpLeft");
    });
    $('#RecUpRight').on('click', function () {
      ChangeCanvasEnableState("stageUpRight");
    });
    $('#RecLeft').on('click', function () {
      ChangeCanvasEnableState("stageLeft");
    });
    $('#RecBack').on('click', function () {
      ChangeCanvasEnableState("stageBack");
    });
    $('#RecRight').on('click', function () {
      ChangeCanvasEnableState("stageRight");
    });

    var canvasWidth = $('#stageBackground').attr('width');
    var canvasHeight = $('#stageBackground').attr('height');
    /*
      thumb click
    */
    document.getElementById('thumb_1').addEventListener('click', function (e) {
      $('#saveBuffer').hide();
      window.TShirt.view_direction = 1;
      changeImage(window.TShirt.view_direction);
      setBackgroundImage(canvasWidth, canvasHeight, "assets/images/front.jpg", 0.85);
      if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
        TShirt.canvasProduct.deactivateAll().renderAll();
      }
      $productSizeTag.hide();
      window.TShirt.clearDesignPanel();
      lastProductCanvasName = "";
      ResetTextPatch();
      // body...
    });
    document.getElementById('thumb_2').addEventListener('click', function (e) {
      $('#saveBuffer').hide();
      window.TShirt.view_direction = 2;
      changeImage(window.TShirt.view_direction);
      setBackgroundImage(canvasWidth, canvasHeight, "assets/images/left.jpg", 0.85);
      if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
        TShirt.canvasProduct.deactivateAll().renderAll();
      }
      $productSizeTag.hide();
      window.TShirt.clearDesignPanel();
      lastProductCanvasName = "";
      ResetTextPatch();
      // body...
    });
    document.getElementById('thumb_3').addEventListener('click', function (e) {
      $('#saveBuffer').hide();
      window.TShirt.view_direction = 3;
      changeImage(window.TShirt.view_direction);
      setBackgroundImage(canvasWidth, canvasHeight, "assets/images/back.jpg", 0.85);
      if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
        TShirt.canvasProduct.deactivateAll().renderAll();
      }
      $productSizeTag.hide();
      window.TShirt.clearDesignPanel();
      lastProductCanvasName = "";
      ResetTextPatch();
      // body...
    });
    document.getElementById('thumb_4').addEventListener('click', function (e) {
      $('#saveBuffer').hide();
      window.TShirt.view_direction = 4;
      changeImage(window.TShirt.view_direction);
      setBackgroundImage(canvasWidth, canvasHeight, "assets/images/right.jpg", 0.85);
      if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
        TShirt.canvasProduct.deactivateAll().renderAll();
      }
      $productSizeTag.hide();
      window.TShirt.clearDesignPanel();
      lastProductCanvasName = "";
      ResetTextPatch();
      // body...
    });
    var path;
    $('.Modal-product-design ul li').click(function (e) {
      // $('.Modal-porduct-catalog').hide('slide',{'direction':'left'} ,1000);
      if ($('.Modal-porduct-catalog').css('display') != 'none') {
        $('.Modal-porduct-catalog').animate({
          width: '0',
          opacity: '0'
        }, 300, function () {
          $('.Modal-porduct-catalog').hide();
          $('.Modal-product-color').show();
        });
      }

      path = $(this).children('img').attr('src');
      $('.Modal-product-color-image embed').attr('src', path);
      var text = $(this).children('label').text();
      $('.Modal-product-color-image div span').text(text);
      // body...
    });

    /*
      add svg image
    */
    $('.Add-image').click(function (e) {

      var item = new SVGItem(path, "", TShirt.canvas);
      item.set("svgname", "svgs");
      window.TShirt.canvas.renderAll();

      $('.MenuBar .editProduct').click();
    });

    /*
      important function...
      save canvasFrom's object to json and send grouped objects to canvasTo (product div)
      ActiveCanvasName: string, (like as canvasTo div name)
    */
    function AddGroup(canvasFrom, canvasTo, ActiveCanvasName) {
      var group = new fabric.Group();
      var ArrayObjects = [];
      var newGroup = false;
      // canvasTo.clear();
      if (canvasFrom._activeObject != null || canvasFrom._activeGroup != null) {
        canvasFrom.discardActiveObject().renderAll();
      }
      // group all objects
      for (var k = 0; k < canvasFrom.getObjects().length; k++) {
        var tmp = canvasFrom.item(k);
        var tmpClone = new fabric.util.object.clone(tmp)
        group.addWithUpdate(tmpClone);
      }
      // canvasFrom.discardActiveObject().renderAll();
      // for (var i = 0; i <  canvasFrom.getObjects().length; i ++) {
      //   canvasFrom.getObjects()[i].active = false;
      // }
      var bottomCanvas = document.getElementById('stageDesign');
      var canvas = fabric.util.createCanvasElement();
      canvas.width = group.width;
      canvas.height = group.height;
      // convert group to image
      canvas.getContext('2d').drawImage(bottomCanvas, group.left, group.top, group.width, group.height, 0, 0, group.width, group.height);
      var dataURL = canvas.toDataURL('image/png');
      fabric.Image.fromURL(dataURL, function (myImg) {
        myImg.top = canvasTo.height / 2;
        myImg.left = canvasTo.width / 2;
        if (canvasTo.width < myImg.width || canvasTo.height < myImg.height) {
          if (canvasTo.width <= myImg.width) {
            var rate = myImg.height / myImg.width;
            myImg.width = canvasTo.width;
            myImg.height = myImg.width * rate;
          } else {
            var rate = myImg.width / myImg.height;
            myImg.height = canvasTo.height;
            myImg.width = myImg.height * rate;
          }
        }
        var activeItem = null;
        // compare last product patch
        for (var k = 0; k < canvasTo._objects.length; k++) {
          var tmp = canvasTo._objects[k];
          if (typeof (tmp.canvasName) != 'undefined' && typeof (tmp.productid) != 'undefined' && window.TShirt.CurrentPatch.canvasName == ActiveCanvasName && window.TShirt.CurrentPatch.productid == tmp.productid) {
            activeItem = tmp;
            break;
          }
        }
        var CurrentUpdatedId = -1;
        if (activeItem == null) {
          // current patch is new patch 
          myImg.canvasName = ActiveCanvasName;
          var ItemLength = 0;
          if (ActiveCanvasName == "stageUpLeft") {
            ItemLength = JsonFrontLeftString.length;
          }
          if (ActiveCanvasName == "stageUpRight") {
            ItemLength = JsonFrontRightString.length;
          }
          if (ActiveCanvasName == "stageLeft") {
            ItemLength = JsonLeftString.length;
          }
          if (ActiveCanvasName == "stageRight") {
            ItemLength = JsonRightString.length;
          }
          if (ActiveCanvasName == "stageBack") {
            ItemLength = JsonBackString.length;
          }
          myImg.productid = ItemLength;
          CurrentUpdatedId = ItemLength;
          myImg.scaleX = myImg.scaleY = 0.7;
        } else {
          // current patch is last patch 
          myImg.canvasName = ActiveCanvasName;
          myImg.productid = activeItem.productid;
          myImg.top = activeItem.top;
          myImg.left = activeItem.left;
          myImg.scaleX = myImg.scaleY = activeItem.scaleX;
          var index = canvasTo._objects.indexOf(activeItem);
          if (index != -1) {
            canvasTo._objects.splice(index, 1);
          }
          activeItem._element = null;
          var index = TShirt.itemsProduct.indexOf(activeItem);
          TShirt.itemsProduct.splice(index, 1);
          CurrentUpdatedId = myImg.productid;
          canvasTo.renderAll();
        }
        if (ActiveCanvasName == "stageUpLeft") {
          JsonFrontLeftString[CurrentUpdatedId] = GetJsonFromCanvas(window.TShirt.canvas);
        }
        if (ActiveCanvasName == "stageUpRight") {
          JsonFrontRightString[CurrentUpdatedId] = GetJsonFromCanvas(window.TShirt.canvas);
        }
        if (ActiveCanvasName == "stageLeft") {
          JsonLeftString[CurrentUpdatedId] = GetJsonFromCanvas(window.TShirt.canvas);
        }
        if (ActiveCanvasName == "stageRight") {
          JsonRightString[CurrentUpdatedId] = GetJsonFromCanvas(window.TShirt.canvas);
        }
        if (ActiveCanvasName == "stageBack") {
          JsonBackString[CurrentUpdatedId] = GetJsonFromCanvas(window.TShirt.canvas);
        }
        window.TShirt.clearDesignPanel();
        // myImg.width = myImg.width * 0.7;
        // myImg.height =  myImg.height * 0.7;
        myImg.initwidth = myImg.width;
        myImg.initheight = myImg.height;
        myImg.lockUniScaling = true;
        myImg.lockScalingX = myImg.lockScalingY = true;
        // add patch as image
        canvasTo.add(myImg);
        // canvasTo.deactivateAll().renderAll();
        TShirt.itemsProduct.push(myImg);
      });
      canvasTo.renderAll();
    }

    /*
      add patch 
    */
    $("#patchadd").on('click', function () {
      $('.letter_menu').removeClass('selected');
      $('#product_size').hide();
      // window.TShirt.itemsProduct.splice(0,window.TShirt.itemsProduct.length);
      if (window.TShirt.view_direction == 2) {
        ChangeCanvasEnableState("stageLeft");
        AddGroup(window.TShirt.canvas, window.TShirt.canvasProduct, "stageLeft");
        // JsonLeftString = GetJsonFromCanvas(window.TShirt.canvas);
        lastProductCanvasName = "";
        // GetCanvasObjectFromJson(JsonLeftString,window.TShirt.canvas);
      } else if (window.TShirt.view_direction == 3) {
        ChangeCanvasEnableState("stageBack");
        AddGroup(window.TShirt.canvas, window.TShirt.canvasProduct, "stageBack");
        // JsonBackString = GetJsonFromCanvas(window.TShirt.canvas);
        lastProductCanvasName = "";
        // GetCanvasObjectFromJson(JsonBackString,window.TShirt.canvas);
      } else if (window.TShirt.view_direction == 4) {
        ChangeCanvasEnableState("stageRight");
        AddGroup(window.TShirt.canvas, window.TShirt.canvasProduct, "stageRight");
        // JsonRightString = GetJsonFromCanvas(window.TShirt.canvas);
        lastProductCanvasName = "";
        // GetCanvasObjectFromJson(JsonRightString,window.TShirt.canvas);
      }

      ChangeCanvasEnableState("hideline");
    });
    /*
      add patch for front left div 
    */
    $("#patchleftadd").on('click', function () {
      $('.letter_menu').removeClass('selected');
      $('#product_size').hide();
      ChangeCanvasEnableState("stageUpLeft");
      AddGroup(window.TShirt.canvas, window.TShirt.canvasProduct, "stageUpLeft");
      lastProductCanvasName = "";
      ChangeCanvasEnableState("hideline");
      // GetCanvasObjectFromJson(JsonFrontLeftString,window.TShirt.canvas);
    });
    /*
      add patch for front left div 
    */
    $("#patchrightadd").on('click', function () {
      $('.letter_menu').removeClass('selected');
      $('#product_size').hide();
      ChangeCanvasEnableState("stageUpRight");
      AddGroup(window.TShirt.canvas, window.TShirt.canvasProduct, "stageUpRight");
      lastProductCanvasName = "";
      ChangeCanvasEnableState("hideline");
      // GetCanvasObjectFromJson(JsonFrontRightString,window.TShirt.canvas);
    });
    /*
      del active product patch item
    */
    $("#patchdel").on('click', function () {
      var canvas_id = window.TShirt.canvasProduct.lowerCanvasEl.id;

      if (window.TShirt.product_activeitem != null) {
        var index = window.TShirt.itemsProduct.indexOf(window.TShirt.product_activeitem);
        if (index != -1) {
          var ArrayProducts = [];
          if (canvas_id == "stageUpLeft") {
            JsonFrontLeftString[window.TShirt.product_activeitem.productid] = "";
          } else if (canvas_id == "stageUpRight") {
            JsonFrontRightString[window.TShirt.product_activeitem.productid] = "";
          } else if (canvas_id == "stageLeft") {
            JsonLeftString[window.TShirt.product_activeitem.productid] = "";
          } else if (canvas_id == "stageBack") {
            JsonBackString[window.TShirt.product_activeitem.productid] = "";
          } else if (canvas_id == "stageRight") {
            JsonRightString[window.TShirt.product_activeitem.productid] = "";
          }
          window.TShirt.itemsProduct.splice(index, 1);
          window.TShirt.product_activeitem._element = null;
          window.TShirt.canvasProduct.remove(window.TShirt.product_activeitem);
          window.TShirt.canvasProduct.renderAll();
        }
      }
      $('#product_size').hide();
      window.TShirt.clearDesignPanel();
      $productSizeTag.hide();
    });
    /*
      reset design div
    */
    $("#patchreset").on('click', function () {
      window.TShirt.clearDesignPanel();
    });
    /*
      save design div objects as json
    */
    $("#patchsave").on('click', function () {
      var content = prompt("enter file name", 'data');
      json = GetJsonFromCanvas(window.TShirt.canvas);
      $("#patchsave").attr('href', "data:json/plain," + encodeURIComponent(json));
      if (content == null) {
        $("#patchsave").removeAttr("href");
        $("#patchsave").removeAttr("download");
        return;
      } else {
        $("#patchsave").attr('download', content + ".json");
      }

      // var link = document.createElement('a');
      // link.download = content+".json";
      // link.href="data:json/plain,"+encodeURIComponent(json);
      // link.click();
    });
    /*
      display left/right patch button
    */
    $('.patch-add-btn').mouseover(function (argument) {
      if (window.TShirt.view_direction == 1) {
        if ($('.add-patch-btn-position').css('display') == 'none') {
          $('.add-patch-btn-position').show();
          // $('#patchadd').hide();
        }
      }
      // body...
    });
    $('.add-patch-btn-position').mouseleave(function (argument) {
      $('.add-patch-btn-position').hide();
      // $('#patchadd').show();
      // body...
    });
    $('#btnAddText').mouseover(function (argument) {
      var select_menu = $('.menu>.active>.selected').children('a').attr('class');
      if (window.TShirt.view_direction == 1 && select_menu == 'addText') {
        if ($('.add-text-btn-position').css('display') == 'none') {
          $('.add-text-btn-position').show();
          // $('#patchadd').hide();
        }
      }
      // body...
    });
    $('.add-text-btn-position').mouseleave(function (argument) {
      $('.add-text-btn-position').hide();
      // $('#patchadd').show();
      // body...
    });
    /*
      display letter patch edit panels 
    */
    $('#letter_tab li').click(function () {
      TShirt.canvas.deactivateAll().renderAll();
      $('.letter_menu').removeClass('selected');
      $(this).addClass('selected');
      TShirt.clearDesignControlPanel();
      if ($(this).attr('id') == 'letter_text_panel') {
        $('.AddTextPane').show();
      }
      if ($(this).attr('id') == 'letter_image_panel') {
        $('.AddImagePane').show();
      }
    });
    /*
      display price edit panels 
    */
    $('#price_tab li').click(function () {

      $('#empty_price').hide();
      $('#total_price').hide();

      $('.price_menu').removeClass('selected');
      $(this).addClass('selected');
      if ($(this).attr('id') == 'front_price') {
        TShirt.calculatePrice("front");

        $('#saveBuffer').hide();
        window.TShirt.view_direction = 1;
        changeImage(window.TShirt.view_direction);
        setBackgroundImage(canvasWidth, canvasHeight, "assets/images/front.jpg", 0.85);
        if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
          TShirt.canvasProduct.deactivateAll().renderAll();
        }
        $productSizeTag.hide();
        window.TShirt.clearDesignPanel();
        lastProductCanvasName = "";

      } else if ($(this).attr('id') == 'left_price') {
        TShirt.calculatePrice("left");

        $('#saveBuffer').hide();
        window.TShirt.view_direction = 2;
        changeImage(window.TShirt.view_direction);
        setBackgroundImage(canvasWidth, canvasHeight, "assets/images/left.jpg", 0.85);
        if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
          TShirt.canvasProduct.deactivateAll().renderAll();
        }
        $productSizeTag.hide();
        window.TShirt.clearDesignPanel();
        lastProductCanvasName = "";

      } else if ($(this).attr('id') == 'back_price') {
        TShirt.calculatePrice("back");

        $('#saveBuffer').hide();
        window.TShirt.view_direction = 3;
        changeImage(window.TShirt.view_direction);
        setBackgroundImage(canvasWidth, canvasHeight, "assets/images/back.jpg", 0.85);
        if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
          TShirt.canvasProduct.deactivateAll().renderAll();
        }
        $productSizeTag.hide();
        window.TShirt.clearDesignPanel();
        lastProductCanvasName = "";
      } else if ($(this).attr('id') == 'right_price') {
        TShirt.calculatePrice("right");

        $('#saveBuffer').hide();
        window.TShirt.view_direction = 4;
        changeImage(window.TShirt.view_direction);
        setBackgroundImage(canvasWidth, canvasHeight, "assets/images/right.jpg", 0.85);
        if (window.TShirt.canvasProduct._activeObject != null || window.TShirt.canvasProduct._activeGroup != null) {
          TShirt.canvasProduct.deactivateAll().renderAll();
        }
        $productSizeTag.hide();
        window.TShirt.clearDesignPanel();
        lastProductCanvasName = "";

      }

    });

    var $letter_text1 = $('.letter_text1');
    var $letter_text2 = $('.letter_text2');
    var $letter_text3 = $('.letter_text3');
    /*
      insert/change letter texts
    */
    $letter_text1.on('change input', function (e) {
      InsertLetterText($letter_text1.val(), 1);
    });
    $letter_text2.on('change input', function (e) {

      if ($letter_text1.val() == "") {
        $letter_text1.val($letter_text2.val());
        $letter_text2.val("");
        InsertLetterText($letter_text1.val(), 1);
        return;
      }
      InsertLetterText($letter_text2.val(), 2);
    });
    $letter_text3.on('change input', function (e) {
      if ($letter_text1.val() == "" || $letter_text2.val() == "") {
        if ($letter_text1.val() == "") {
          $letter_text1.val($letter_text3.val());
          $letter_text3.val("");
          InsertLetterText($letter_text1.val(), 1);
          return;
        } else if ($letter_text2.val() == "") {
          $letter_text2.val($letter_text3.val());
          $letter_text3.val("");
          InsertLetterText($letter_text2.val(), 2);
        }
        return;
      }
      InsertLetterText($letter_text3.val(), 3);
    });

    /*
      insert/change letter texts
    */
    function InsertLetterText(value, letter_id) {
      var value = value || "",
        item = null;

      var activeItem;
      // get last letter
      for (var k = 0; k < TShirt.items.length; k++) {
        var obj_item = TShirt.items[k];
        if (typeof (obj_item.elem.letter_id) != 'undefined' && obj_item.elem.letter_id == letter_id) {
          activeItem = obj_item;
        }
      }

      if (typeof (activeItem) != 'undefined') {
        // set letter text
        activeItem.set('text', value);
      } else {
        if (!value) {

          return;
        }
        // set active letter's options form letter edit panels value
        var $letter_color = $('.letter-color').next('.palette-color-picker-button').css('background-color').toString().split(" none"),
          $letter_bordercolor = $('.letter-border .colorpicker').next('.palette-color-picker-button').css('background-color').toString().split(" none"),
          $letter_borderstyle = $('.letter-borderstyle').val(),
          $letter_boderwidth = $('.letter-boderwidth').val(),
          $letter_innerborderwidth = $('.letter-innerborderwidth').val(),
          $letter_innerborder_color = $('.letter-innerborder .colorpicker').next('.palette-color-picker-button').css('background-color').toString().split(" none"),
          $letter_innerborderstyle = $('.letter-innerborder .letter-innerborderstyle').val(),
          $letter_fontstyle = $('.letter-style .fontAnchor').val();
        item = new TextItem(value, "", window.TShirt.canvas);
        item.ensureTextPosition();
        $('.panes').css('height', '550px');
        if (!TShirt.overlap) {
          if (!item.setRenderPosition()) {
            item.elem.remove();
            alert("There is no space to add text");
            return;
          }
        }
        // set other options
        window.TShirt.items.push(item);

        item.activate();
        item.elem.fontFamily = $letter_fontstyle;
        item.options.fontFamily = $letter_fontstyle;
        // $fontFamily.val(options.fontFamily);
        item.savePosition();
        item.set("fontSize", 100);
        item.set("fontFamily", $letter_fontstyle);
        item.set("fill", $letter_color[0]);
        item.set("borderColor", $letter_bordercolor[0]);
        item.set("borderStyle", $letter_borderstyle);
        item.set("borderWidth", $letter_boderwidth);
        item.set("innerBorderColor", $letter_innerborder_color[0]);
        item.set("innerBorderStyle", $letter_innerborderstyle);
        item.set("innerBorderWidth", $letter_innerborderwidth);
        item.set("letter_id", letter_id);
        window.TShirt.canvas.sendToBack(item.elem);
        item.set("left", parseFloat(window.TShirt.canvas.width * letter_id / 4));
        TShirt.canvas.setActiveObject(item.elem);
        TShirt.canvas.renderAll();
      }
      TShirt.syncLayers();
      // TShirt.canvas.deactivateAll().renderAll();
      TShirt.canvas.renderAll();
    }
    /*
    delete active item in design div  
    */
    $('.delete_image_btn').click(function () {
      var activeItem = window.TShirt.activeItem;
      if (!activeItem) {
        return;
      }
      window.TShirt.deleteItem(activeItem);
      $('#letter_image_panel').addClass('selected');
      changeViewState("editImage", 1);
      ResetTextPatch();
    });

    $alignCenter.click(function () {
      window.TShirt.activeItem.set("top", window.TShirt.canvas.height / 2);
      window.TShirt.activeItem.set("left", window.TShirt.canvas.width / 2);
      window.canvas.renderAll();
    });
    /*
    show product item zoom
    */
    function product_size() {
      $('.workstaion_pane').hide();
      $('.product_size').show();
    }
    /*
    reset letterpatch edit panel
    */
    function ResetLetterPatch() {
      $('.letter_text1,.letter_text2,.letter_text3').val('');
      $('.letter-style .color .palette-color-picker-button').css('background', "#000000");
      $('.letter-style .letter-border .palette-color-picker-button').css('background', "#000000");
      $('.letter-style .letter-innerborder .palette-color-picker-button').css('background', "#000000");
      $('.letter-borderstyle').val("none");
      $('.letter-boderwidth').val(1);
      $('.letter-innerborderstyle').val("none");
      $('.letter-innerborderwidth').val(1);
      $('.letter-font-family').val("Tahoma");
    }
    /*
    reset text edit panel
    */
    function ResetTextPatch() {
      window.TShirt.activeItem = '';
      $('.edit_text_panel .color .palette-color-picker-button').css('background', "#000000");
      $('.edit_text_panel .border-textedit .palette-color-picker-button').css('background', "#000000");
      $('.edit_text_panel .innerborder-textedit .palette-color-picker-button').css('background', "#000000");
      $('.edittext-borderstyle').val("none");
      $('.edittext-borderWidth').val(1);
      $('.edittext-innerBorderStyle').val("none");
      $('.edittext-innerBorderWidth').val(1);
      $('.edit-font-family').val("Tahoma");
      $('#txtDel').val("");
      $text.hide();
            // when change drawing style, txtDel is Broken, so this bug code
      var hh = $text.css('width');
      $text.css('width', '0px');
      // that.refreshDrawingStyle(value, oldVal);
      $text.show();
      $text.css('width', hh);
      $fontSize.val(20);
      $fontSizeNum.val(20);
      $italic.prop("checked", false);
      $bold.prop("checked", false);
      $underline.prop("checked", false);
      $drawingStyle.val("Straight");
      $('.text-spacing').hide();
      $('.text-lineheight').hide();
      $curveDegree.val(0);
      $spaceSize.val(0);
      $angle.val(0);
      $lineSpacingSize.val(0);
      $textHAlign.val("center");
      $textVAlign.val("center");
    }
    /*
    create svg color fills edit boxs dynamic
    */
    function CreateSvgColorpicker(obj) {
      var colorpicker_counter = obj.getFillColorArray();
      var colorpickerobj = '';
      var colorpicker_html = '<input type="text" name="fill">';
      var emptycolor = [];
      $.each(colorpicker_counter, function (key, value) {
        var str = value.toString().substring(0, 1);
        if (str != "#") {
          emptycolor.push(key);
        }
        colorpickerobj = colorpickerobj + '<input type="text" name="fill"' + ' onchange = setFillColor(' + key + '); ' + 'class="colorpicker editimagepane_svg_colorpicker' + key + '" value="' + value + '">';
      });
      $('.editimagepane_svg').append(colorpickerobj);
      for (var i = 0; i < obj.getFillColorArray().length; i++) {
        SvgInitColorpicker(i);
        $('.editimagepane_svg .editimagepane_svg_colorpicker' + i).next('div').css('background', $('.editimagepane_svg_colorpicker' + i).val());
      }
      for (var k = 0; k < emptycolor.length; k++) {
        $('.editimagepane_svg_colorpicker' + emptycolor[k]).next('div').css('background-image', "url(assets//images//color-empty.png)");
      }
    }
    /*
    create svg patch fills edit boxs dynamic
    */
    function CreateSvgPatternPicker(obj) {
      var pattern_array = obj.getFillColorArray();
      var colorpickerobj = '';
      $.each(pattern_array, function (key, value) {
        var str = value.toString().substring(0, 1);
        if (str == "#") {
          value = "assets\\images\\pattern-empty.png";
        } else {
          value = value.source.currentSrc;
        }
        colorpickerobj = colorpickerobj + '<input id=\"PatternFile' + key + '\"  type=\"file\" style=\"display:none\" accept=\"image/*\" size=\"200MB\"><img id=\"PatternImg' + key + '\" onclick =setFillPattern(' + key + '); src = ' + value + '>';
      });
      $('.pattern_container').append(colorpickerobj);
    }
    /*
    set svg active item's fill color by id
    called form colorpicker
    */
    function setFillColor(id) {
      var color = $('.editimagepane_svg_colorpicker' + id).val();
      TShirt.activeItem.setFillColorByID(id, color);
      $('#PatternImg' + id).attr('src', "assets\\images\\pattern-empty.png");
    }
    /*
    set svg active item's fill pattern by id
    called form pattern picker
    */
    function setFillPattern(id) {
      $("#PatternFile" + id).trigger('click');
      document.getElementById('PatternFile' + id).addEventListener("change", function (e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function (f) {
          var data = f.target.result;
          $("#PatternImg" + id).attr("src", data);
          var pattern = new fabric.Pattern({
            source: data,
            repeat: "repeat"
          });
          fabric.Image.fromURL(data, function (img) {
            if (TShirt.activeItem.type == "path-group") {
              TShirt.activeItem.setFillColorByID(id, pattern);
              $('.editimagepane_svg_colorpicker' + id).next('div').css('background-image', "url(assets//images//color-empty.png)");
            }
            TShirt.canvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
        window.TShirt.canvas.renderAll();
        // $('.MenuBar .addText').click();
      });
    }
    /*
    init color picker
    */
    function SvgInitColorpicker(order) {
      $('.editimagepane_svg_colorpicker' + order).paletteColorPicker({
        // Color in { key: value } format
        colors: [{
            "#E91E63": "#E91E63"
          },
          {
            "#1abc9c": "#1abc9c"
          },
          {
            "#2ecc71": "#2ecc71"
          },
          {
            "#3498db": "#3498db"
          },
          {
            "#16a085": "#16a085"
          },
          {
            "#27ae60": "#27ae60"
          },
          {
            "#2980b9": "#2980b9"
          },
          {
            "#8e44ad": "#8e44ad"
          },
          {
            "#2c3e50": "#2c3e50"
          },
          {
            "#f1c40f": "#f1c40f"
          },
          {
            "#e67e22": "#e67e22"
          },
          {
            "#ecf0f1": "#ecf0f1"
          },
          {
            "#95a5a6": "#95a5a6"
          },
          {
            "#C2185B": "#C2185B"
          },
          {
            "#F8BBD0": "#F8BBD0"
          },
          //
          {
            "#774489": "#774489"
          },
          {
            "#894468": "#894468"
          },
          {
            "#466454": "#466454"
          },
          {
            "#534489": "#534489"
          },
          {
            "#7904F5": "#7904F5"
          },
          {
            "#04F51E": "#04F51E"
          },
          {
            "#040CF5": "#040CF5"
          },
          {
            "#e74c3c": "#e74c3c"
          }

        ],
        // Add custom class to the picker
        custom_class: 'double',
        // Force the position of picker's bubble
        position: 'downside', // default -> 'upside'
        // Where is inserted the color picker's button, related to the input
        insert: 'after', // default -> 'before'
        // Don't add clear_btn
        clear_btn: 'last', // null -> without clear button, default -> 'first'
        // Timeout for the picker's fade out in ms
        timeout: 1000, // default -> 2000
        // Forces closin all bubbles that are open before opening the current one
        close_all_but_this: false, // default is false
        // Sets the input's background color to the selected one on click
        // seems that some users find this useful ;)
        set_background: true, // default is false

        // Events
        // Callback on bubbl show
        onbeforeshow_callback: function (what) {

        },

        // Callback on change value
        onchange_callback: function (clicked_color) {
          $('.editimagepane_svg_colorpicker' + order).val(clicked_color).trigger('change');
        }
      });
    }
    /*
    spiner disabled
    */
    function setPreLoader(flag) {
      if (flag) {
        $preloader.css('display', 'block');
      } else {
        $preloader.css('display', 'none');
      }
    }
    // working with file upload
    $('#openUpload').find('a').click(function () {
      $('#openUpload').css({
        'visibility': 'hidden'
      });
      $('#openUpload').css({
        'opacity': '0'
      });
      $('#openUpload').css({
        'transition': 'visibility 450ms, opacity 400ms linear'
      });
    });

    $('.upload').children().click(function () {
      // $('.file').val("");
      // $('.file').click();
      $("#uploadPanel").html("Drop files or click to upload");
      $('#uploadPanel').css({
        'padding-top': 250,
        'padding-bottom': 250
      });
      $('#openUpload').css({
        'visibility': 'visible'
      });
      $('#openUpload').css({
        'opacity': '1'
      });
      $('#openUpload').css({
        'transition': 'visibility 0ms, opacity 400ms linear'
      });
    });
    /*
    working with file upload dialog
    */
    document.getElementById('file').addEventListener("change", function (e) {

      var file = e.target.files[0];
      var reader = new FileReader();
      var pic_name = file.name;
      reader.onload = function (f) {
        var fileCollection = {
          data: f.target.result,
          lastModified: file.lastModifiedDate,
          name: file.name,
          size: file.size,
          type: file.type,
        };

        setUploadPanelPicture(fileCollection);
        // var data = f.target.result;
        // var item = new ImageItem(data,"", window.TShirt.canvas);
        // item.set("imgname",pic_name);
        // window.TShirt.items.push(item);
        // window.TShirt.syncLayers();
        // item.refreshPosition();
      };
      reader.readAsDataURL(file);
      window.TShirt.canvas.renderAll();
      // $('.MenuBar .addText').click();
    });

    var tmpAddImageBuffer;
    //add image to design canvas
    $('#btnAddImage').click(function () {
      $('#openUpload').css({
        'visibility': 'hidden'
      });
      $('#openUpload').css({
        'opacity': '0'
      });
      $('#openUpload').css({
        'transition': 'visibility 450ms, opacity 400ms linear'
      });
      $('#uploadPanel').removeClass("dragEnter");
      if (tmpAddImageBuffer != "") {
        setUploadResult(tmpAddImageBuffer);
        tmpAddImageBuffer = "";
      }
    });
    //add image item to design canvas
    function setUploadResult(fileCollection) {
      var data = fileCollection.data;
      var item = new ImageItem(data, "", window.TShirt.canvas);
      item.set("imgname", fileCollection.name);
      window.TShirt.items.push(item);
      window.TShirt.syncLayers();
      item.refreshPosition();
    }
    /*
      set uploaded image to upload div
    */
    function setUploadPanelPicture(fileCollection) {
      var $outputArea = $("#uploadPanel");
      var newHtml = '';
      var img = new Image();
      img.onload = function () {
        var width = img.width;
        var height = img.height;
        var rate = 0;
        if (width > height && width > 450) {
          rate = parseFloat(height / width);
          width = 450;
          height = width * rate;
        }
        if (height > width && height > 450) {
          rate = parseFloat(rate = width / height);
          height = 450;
          width = width * rate;
        }
        if (height == width && (width >= 450 || height >= 450)) {
          width = height = 450;
        }
        img.width = width;
        img.height = height;
        $('#uploadPanel').css({
          'padding-top': (250 - img.height / 2),
          'padding-bottom': (250 - img.height / 2)
        });
        if (fileCollection.type.indexOf('image') >= 0) {
          newHtml += '<img width = ' + img.width + 'px height = ' + img.height + 'px src="' + fileCollection.data + '"/>';
        } else {
          var noScheme = $.removeUriScheme(fileCollection.data);
          var base64Decoded = window.atob(noScheme);
          var htmlEncoded = htmlEncode(base64Decoded);
          newHtml += '<p>' + htmlEncoded + '</p>';
        }
        newHtml += "<hr />";
        $outputArea.html(newHtml);
        tmpAddImageBuffer = fileCollection;
      }
      img.src = fileCollection.data;

    }
    // support file upload 
    $(function () {
      if ($.support.fileDrop) {
        $('#uploadPanel').fileDrop({
          decodeBase64: true,
          removeDataUriScheme: false,
          onFileRead: function (fileCollection) {
            if (console) {
              console.clear();
              console.log("---File Collection---");
              console.log(fileCollection);

              console.log(fileCollection);
              setUploadPanelPicture(fileCollection[0]);
            }
          }
        });
        $('#uploadPanel').click(function () {
          $('.file').val("");
          $('.file').click();
        });
        $('#uploadPanel').on({
          dragenter: function () {
            $('#uploadPanel').addClass("dragEnter");
          },
          dragleave: function () {
            $('#uploadPanel').removeClass("dragEnter");
          },
        });

      } else {
        alert('Your browser does not support file drag-n-drop :(');
      }
    });

    function htmlEncode(value) {
      var el = document.createElement('div');
      if (value) {
        el.innerText = el.textContent = value;
        return el.innerHTML;
      }
      return value;
    }