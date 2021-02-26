/**
 * Shopify Ajaxify Shop. 
 * 
 * @uses Modified Shopify jQuery API (link to it)
 *
 */

// Binding events every time when open modal window with cart
var  bindEventsInCart = function(){
  
  var modalForm = $(".modal-popup form");
    $additionCheckoutBlock = modalForm.find("#additional-checkout-block");
    $additionCheckoutBlock.load('/cart #addCheckoutBtn', function() {
      if (window.Shopify && Shopify.StorefrontExpressButtons) {
        Shopify.StorefrontExpressButtons.initialize();
      }
    });

  const totalPricePopup = document.getElementById('total-price-popup');

  if (totalPricePopup) {
    const num = Number(totalPricePopup.innerHTML.replace('$', '').trim());
    const minShipping = document.getElementById('min-shipping-cart') || document.getElementById('min-shipping');
    const checkoutButton = document.getElementById('button_checkout-cart') || document.getElementById('button_checkout');
    const discount = document.getElementById('discount-cart') || document.getElementById('discount');

    if (discount && minShipping) {
      minShipping.innerHTML = ''
    } else {
      if (minShipping && checkoutButton) {
        minShipping.innerText = '';

        if (num < 50) {
          const diff = (50 - num).toFixed(2);
          minShipping.innerText = `Spend $${diff} more to qualify for FREE shipping`;
        }
        // } else if (num < 150) {
        //   const diff = (150 - num).toFixed(2);
        //   minShipping.innerText = `Spend $${diff} more to get $10 off`;
        // }
      }
    }
  }
  

  $(".cart_menu").on("click",".remove_item_button", function(e){
    e.preventDefault();

    var el = $(this),
        id = el.data('id') || null;

    Shopify.removeItem(id, function(cart){
      Shopify.updateQuickCart(cart);
    });
  });

  /////////////////////////////////////
  // Qty for cart modal
  /////////////////////////////////////
  jQuery(".cart_menu").on("click", ".minus_btn", function () {
    var inputEl = jQuery(this).parent().find("input");
    var qty = inputEl.val();
    if (jQuery(this).parent().hasClass("minus_btn"))
      qty++;
    else
      qty--;
    if (qty < 0)
      qty = 0;
    inputEl.val(qty);

    var quantity = qty,
        id = inputEl.data("id");
    if(quantity != 0){
       var line = $(this).closest("ul").index();
       Shopify.changeItemByLine(line, quantity, function(cart){
        Shopify.updateQuickCart(cart);
      });
    }
    else{
      Shopify.removeItem(id, function(cart){
        Shopify.updateQuickCart(cart);
      });
    }
  })


  jQuery(".cart_menu").on("click",".plus_btn", function () {
    var inputEl = jQuery(this).parent().find("input");
    var qty = inputEl.val();

    if (jQuery(this).hasClass("plus_btn"))
      qty++;
    else
      qty--;
    if (qty < 0)
      qty = 0;


    var quantity = qty,
        id = inputEl.data("id");


       var line = $(this).closest("ul").index();
        Shopify.changeItemByLine(line, quantity, function(cart){
          var updatedItem = cart.items.filter(function(item){ return item.variant_id == id });

          var totalUpdatedItemQty = 0;
          
          for(var j=0;j<updatedItem.length;j++){
            totalUpdatedItemQty += updatedItem[j].quantity;
          }
          
          if(updatedItem.length && totalUpdatedItemQty >= quantity){
            Shopify.updateQuickCart(cart);
            inputEl.val(quantity);
          }
      else{
        jQuery('.ajaxcart__item__' + id + '__errors').show().delay(2000).fadeOut();
      }
    });

  })


  jQuery(".cart_menu").on("keyup",".number_val_input", function (event) {
    this.value=this.value.replace(/[^0-9]/g, '');  
  });

  jQuery(".cart_menu").on("change",".number_val_input", function (event) {
    var inputEl = $(this);
    var qty = inputEl.val();

    var quantity = qty.replace(/[^0-9]/g, ''),
    id = inputEl.data("id");

    if(quantity > 0){
      var line = $(this).closest("ul").index();
        Shopify.changeItemByLine(line, quantity, function(cart){
          var updatedItem = cart.items.filter(function(item){ return item.variant_id == id });

          var totalUpdatedItemQty = 0;
          
          for(var j=0;j<updatedItem.length;j++){
            totalUpdatedItemQty += updatedItem[j].quantity;
          }
          
          if(updatedItem.length && totalUpdatedItemQty >= quantity){
            Shopify.updateQuickCart(cart);
            inputEl.val(quantity);
          }
        else{
          jQuery('.ajaxcart__item__' + id + '__errors').show().delay(2000).fadeOut();
        }
      });
    }else{
      Shopify.removeItem(id, function(cart){
        Shopify.updateQuickCart(cart);
      });
    }


  });

  
  /// Save cart note///
  $(".cart_menu").on("focusout","textarea", function(){
    var note = $(this).val(),
        textareas = $(".div.cart_menu").find("textarea").add($(".cart_tbl textarea"));

    Shopify.updateCartNote(note, function(){
      $(textareas).each(function () {
        $(this).val(note);
        $(this).text(note);
      });
    });
  });

  /// Closing modal///
  $(".cart_menu").on("click",".info_btn", function(){
    var magnificPopup = $.magnificPopup.instance;
    if(typeof magnificPopup !== 'undefined'){
      magnificPopup.close();
    }
  });
  $(".cart_menu").on("click",".btn_close", function(){
    var magnificPopup = $.magnificPopup.instance;
    if(typeof magnificPopup !== 'undefined'){
      magnificPopup.close();
    }
  });
  
}

jQuery(document).ready(function() { 
  //Begin Wrapper

  var jQ = jQuery;

  /**
 * Collection of Selectors for various pieces on the page we need to update 
 *
 * I've tried to keep these as general and flexible as possible, but 
 * if you are doing your own markup, you may find you need to change some of these.
 *
 */
  var selectors = {
    // Any elements(s) with this selector will have the total item count put there on add to cart.
    TOTAL_ITEMS: '.count', 
    TOTAL_PRICE: '.cart-total-price',
    SUBMIT_ADD_TO_CART: 'input[type=image], input.submit-add-to-cart',
    FORM_ADD_TO_CART: 'form[action*="/cart/add"]',
    FORM_UPDATE_CART: 'form[name=cartform]',
    //The actual Update Button
    FORM_UPDATE_CART_BUTTON: 'form[name=cartform] input[name=update]',
    //All the buttons on the form
    FORM_UPDATE_CART_BUTTONS: 'input[type=image], input.button-update-cart',
    LINE_ITEM_ROW: '.cart-line-item',
    LINE_ITEM_QUANTITY_PREFIX: 'input#updates_',
    LINE_ITEM_PRICE_PREFIX: '.cart-line-item-price-',
    LINE_ITEM_REMOVE: '.remove a',
    EMPTY_CART_MESSAGE: '#empty',
    QUICK_CART_MENU: 'div.cart_menu',
    CART_PAGE_MENU: '.cart_tbl'
  };

  /**
 * Collection of text strings. This is where you would change for a diff language, for example. 
 *
 */
  var text = {
    ITEM: 'Item', 
    ITEMS: 'Items'
  };

  //Convenience method to format money. 
  //Can just transform the amount here if needed
  window.formatMoney = function(price) {
    return Shopify.formatMoney(price, app.data.money_format);
  };

  //We only want to interrupt the UPDATE, not the CHECKOUT process
  jQ(selectors.FORM_UPDATE_CART_BUTTON).click(function(e) {
    e.preventDefault();
    jQ(e.target.form).find(selectors.FORM_UPDATE_CART_BUTTONS).attr('disabled', true).addClass('disabled');
    Shopify.updateCartFromForm(e.target.form);
  });

  //Delegate the Remove Link functionality on the cart page.
  jQ(selectors.FORM_UPDATE_CART).delegate(selectors.LINE_ITEM_REMOVE, 'click', function(e) {
    e.preventDefault();
    //Get the variant ID from the URL
    var vid = this.href.split('/').pop().split('?').shift();
    Shopify.removeItem(vid);
    jQ(this).parents(selectors.LINE_ITEM_ROW).remove();
  });

  /**
 * Shopify.showModal
 * 
 * @param string contents
 * @param integer hideDelay
 */
  Shopify.modalTimer = false;
  Shopify.showModal = function(contents,hideDelay) {
    $("html").css("overflow-y","hidden");

    //Ensure the plugin is loaded
    if(typeof $().magnificPopup !== 'function'){ return }

    //Check the function vars have been sent
    if(typeof contents === 'undefined'){ return }
    //if(typeof hideDelay === 'undefined'){ var hideDelay = 7000 /* default */ }

    //Open the modal
    $.magnificPopup.open({
      items: {
        src: '<div class="mfp-with-anim modal-popup">'+contents+'</div>',
        type: 'inline'
      },
      mainClass: 'mfp-move-from-top',
      removalDelay: 1000,
      callbacks: {
        close: function() {
          $("html").css("overflow-y","auto");
        }
      }
    });

    bindEventsInCart();
  };

  
  Shopify.addImageSize = function(src,size){
    if(typeof size === 'undefined'){ return src; }
    if(src === null){ return "\/\/cdn.shopify.com\/s\/files\/1\/0275\/0853\/9474\/t\/16\/assets\/no-image.gif?v=7079148615093828442" }
    size = '_' + size + '.';
    return src.replace(/.([^.]*)$/,size+'$1');
  };

  
  Shopify.updateQuickCart = function(cart){
    
    var t = jQ(selectors.QUICK_CART_MENU),
        c = jQ(selectors.CART_PAGE_MENU);
    if(t.length){

      if(cart.items.length){

        var toAppend = [],
            tableHeader = '<ul><li>Photo</li>'+
        '<li>Name</li>'+
        '<li>Price</li>'+
        '<li>Quantity</li>'+
        '<li>Total</li></ul>';
        
        var discounts_html = '';            
        if(cart.cart_level_discount_applications.length){
           
            for(var k=0;k<cart.cart_level_discount_applications.length;k++){
              var total_allocated_amount_val = cart.cart_level_discount_applications[k].total_allocated_amount;
              
              var total_allocated_amount_converted = Shopify.formatMoney(total_allocated_amount_val, app.data.money_format);              
              
              
              
             discounts_html = discounts_html+ '<div class="order-discount-cart-wrapper"><span class="order-discount--cart total_val">'+
               '<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-saletag"><path d="M10 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0-3H7a1 1 0 0 0-.71.29l-6 6a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.42 0c.19-.2 5.8-5.81 6-6A1 1 0 0 0 12 5V2a2 2 0 0 0-2-2z"/></svg>'+
               cart.cart_level_discount_applications[k].title +'</span><span class="order-discount--cart-total" id="discount">(-'+total_allocated_amount_converted+')</span></div>';
                         
            }             
          }
        

        for (var i = 0; i < cart.items.length; i++) {
          var itemPrice = cart.items[i].original_price,
              finalItemPrice = cart.items[i].final_price,
              totalPrice = cart.total_price,
              linePrice = cart.items[i].original_line_price,       
              finalLinePrice = cart.items[i].final_line_price,      
              title = cart.items[i].variant_title,
              cartNote = cart.note,	       
              properties = cart.items[i].properties || null,
              item_discounts_html = "";
          
          if(properties != null){
            var propertiesText="";

            _.forOwn(properties, function(value, key) { 

              if(_.includes(value, "/uploads/")){
                propertiesText=propertiesText+key+": <a href='"+value+"'>"+_.last(value.split('/'))+"</a><br/>"
              }else{
                propertiesText=propertiesText+key+": "+value+"<br/>"
              }

            });
          }else{
            var propertiesText="";
          }


          if(title == null){
            title = "";
          }
          if(cartNote == null){
            cartNote = "";
          }
          
          

          //convert prices
          var itemPriceConverted = Shopify.formatMoney(itemPrice,app.data.money_format),
              totalPriceConverted = Shopify.formatMoney(totalPrice,app.data.money_format),
              linePriceConverted = Shopify.formatMoney(linePrice,app.data.money_format);
          
          if(linePrice != finalLinePrice){
            var finalLinePriceConverted = Shopify.formatMoney(finalLinePrice,app.data.money_format);
          }
          
          if(itemPrice != finalItemPrice){
            var finalItemPriceConverted = Shopify.formatMoney(finalItemPrice,app.data.money_format);
          }
                       
          
          
          

          
          
           if(linePrice != finalLinePrice){
             var linePriceContent = '<span class="price money original_price">'+linePriceConverted+'</span>'+
             '<br class="clearfix"><span class="money price">'+ finalLinePriceConverted +'</span>';            
           }else{
            var linePriceContent = '<span class="money price">'+ linePriceConverted +'</span>';
           }
          
           if(itemPrice != finalItemPrice){
             var itemPriceContent = ' <span class="price money original_price">'+itemPriceConverted+'</span>'+
                 '<br class="clearfix"><span class="price money">'+finalItemPriceConverted+'</span>';
           }else{
             var itemPriceContent = '<span class="price money">'+itemPriceConverted+'</span>'
           }
           
            if(cart.items[i].line_level_discount_allocations.length){
            var item_discounts_html = '<br class="clearfix"><div class="order-discount--list">'
            for(var k=0;k<cart.items[i].line_level_discount_allocations.length;k++){
              var item_allocated_amount_val = cart.items[i].line_level_discount_allocations[k].amount;
              
              var item_allocated_amount_converted = Shopify.formatMoney(item_allocated_amount_val, app.data.money_format);              
              
              
             item_discounts_html = item_discounts_html+ '<span class="order-discount__item">'+
               '<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-saletag"><path d="M10 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0-3H7a1 1 0 0 0-.71.29l-6 6a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.42 0c.19-.2 5.8-5.81 6-6A1 1 0 0 0 12 5V2a2 2 0 0 0-2-2z"/></svg>'+
              cart.items[i].line_level_discount_allocations[k].discount_application.title +' (-'+item_allocated_amount_converted+')</span></div>';
              
            }        
              item_discounts_html = item_discounts_html + '</div>'
            
          }
          
          
          var row = '<ul><li><div class="thumb"><a href="' + cart.items[i].url + 
              '"><img src="' + Shopify.addImageSize(cart.items[i].image,'small') + '" alt="' + cart.items[i].title + 
              '"></a></div></li><li><h5><a href="' + cart.items[i].url + 
              '" class="item-name">' + cart.items[i].product_title + 
              '</a></h5><p class="product-type">'+title+'</p><p>'+propertiesText+'</p><a href="#" data-id="'+cart.items[i].id+'" class="remove_item_button">Remove</a></li>'+
              '<li><p class="mobile-label-price">Price</p>'+itemPriceContent + ' ' + item_discounts_html + '</li>' + 
              '<li><p class="mobile-label-quantity">Quantity</p><a class="minus_btn"></a><input type="text" name="updates[]" class="txtbox number_val_input" min="0" id="updates_'+cart.items[i].id+'" data-id="'+cart.items[i].id+'" value="'+cart.items[i].quantity+'" /><a class="plus_btn"></a>'+
              '<div class="ajaxcart__errors text-center ajaxcart__item__'+cart.items[i].id+'__errors">All available stock is in cart</div></li>'+    
              '<li><p class="mobile-label-total">Total</p>'+linePriceContent + 
              '</li><hr class="line_items_separator"></ul>';
          toAppend.push(row);
        };
        var terms_checkbox = '';
        
        var checkoutRow = t.find('div.checkout_row'),
            subtotalRow = t.find('.total_row'),
            subtotalRowCartPage = c.find(".total_row");

        const num = Number(totalPriceConverted.replace('$', '').trim());
        const minShipping = document.getElementById('min-shipping-cart') || document.getElementById('min-shipping');
        const checkoutButton = document.getElementById('button_checkout-cart') ||document.getElementById('button_checkout');
        const discount = document.getElementById('discount-cart') || document.getElementById('discount');

        if (discount && minShipping) {
          minShipping.innerHTML = ''
        } else {
          if (minShipping && checkoutButton) {
            minShipping.innerText = '';

            if (num < 50) {
              const diff = (50 - num).toFixed(2);
              minShipping.innerText = `Spend $${diff} more to qualify for FREE shipping`;
            }
            
            // } else if (num < 150) {
            //   const diff = (150 - num).toFixed(2);
            //   minShipping.innerText = `Spend $${diff} more to get $10 off`;
            // }
          }
        }
              

        if(checkoutRow.length){ /* we have existing items in the quick cart */
          t.find('div.cart_row').html(toAppend.join(''));
          t.find('div.cart_row').prepend(tableHeader);
          c.find(".con_row").html(toAppend.join(''));
          
          var subtotalRowHtml = '<ul><li>'+discounts_html+'<span class="total_val">Subtotal:</span><span class="money total-price">'+totalPriceConverted+'</span></li></ul>';
          subtotalRowCartPage.html(subtotalRowHtml);
          subtotalRow.html(subtotalRowHtml);
          
          const num = Number(totalPriceConverted.replace('$', '').trim());
          const minShipping = document.getElementById('min-shipping-cart') || document.getElementById('min-shipping');
          const checkoutButton = document.getElementById('button_checkout-cart') || document.getElementById('button_checkout');
          const discount = document.getElementById('discount-cart') || document.getElementById('discount');

          if (discount && minShipping) {
            minShipping.innerHTML = ''
          } else {
            if (minShipping && checkoutButton) {
              minShipping.innerText = '';

              if (num < 50) {
                const diff = (50 - num).toFixed(2);
                minShipping.innerText = `Spend $${diff} more to qualify for FREE shipping`;
              }
              // } else if (num < 150) {
              //   const diff = (150 - num).toFixed(2);
              //   minShipping.innerText = `Spend $${diff} more to get $10 off`;
              // }
            }
          }
      
        }else{
          

          checkoutRow = '<div class="checkout_row clearfix"><div id="min-shipping"></div>' + terms_checkbox + '<div class="checkout-buttons"><a href="javascript:void(0)" class="info_btn"><span class="fa fa-chevron-left"></span>Continue Shopping</a><button type="submit" name="checkout" value="Check Out" class="btn_c" id="button_checkout">Check Out</button></div>';
          subtotalRow = '<div class="total_row clearfix"><ul><li>'+discounts_html+'<span class="total_val">Subtotal:</span><span class="money total-price">'+totalPriceConverted+'</span></li></ul></div>';
          var addCheckOutBlock = '<div id="additional-checkout-block" class="text-right additional-checkout-buttons" ></div>';
          var form = jQ('<form />',{
            'action':'/cart',
            'method':'post',
            'novalidate':'novalidate'
          })
              
              if(true){
                var notesRow='<div class="clearfix order_notes">'+
                    '<label for="cartSpecialInstructions" class="sr-only">Order Notes:</label>'+
                    '<textarea name="note" id="cartSpecialInstructionsFromPopup" class="note_text" placeholder="Order Notes">'+ cartNote +'</textarea></div>';
              }
          else{
            var notesRow='';
          }
          form.append($("div.cart_row"));
          form.find("div.cart_row").html(toAppend.join(''));
          form.find('div.cart_row').prepend(tableHeader);
          form.append(subtotalRow);
          form.append(notesRow);
          
          form.append(checkoutRow);
          form.append(addCheckOutBlock);
          t.append(form);
          
          const num = Number(totalPriceConverted.replace('$', '').trim());
          const minShipping = document.getElementById('min-shipping-cart') || document.getElementById('min-shipping');
          const checkoutButton = document.getElementById('button_checkout-cart') || document.getElementById('button_checkout');
          const discount = document.getElementById('discount-cart') || document.getElementById('discount');

          if (discount && minShipping) {
            minShipping.innerHTML = ''
          } else {
            if (minShipping && checkoutButton) {
              minShipping.innerText = '';

              if (num < 50) {
                const diff = (50 - num).toFixed(2);
                minShipping.innerText = `Spend $${diff} more to qualify for FREE shipping`;
              }
              // } else if (num < 150) {
              //   const diff = (150 - num).toFixed(2);
              //   minShipping.innerText = `Spend $${diff} more to get $10 off`;
              // }
            }
          }
   
        }

      }
      else{
        t.html('<div class="menu_title clearfix"><h4>Shopping Cart</h4> </div><div class="cart_row"><div class="empty-cart">Your cart is currently empty.</div><p><a href="javascript:void(0)" class="btn_c btn_close">Continue Shopping</a></p></div>'); 
        c.html('<div class="empty-cart-message"><p>Your cart is currently empty.</p><p><a href="/collections/all" class="btn_c">Continue Shopping</a></p></div');
       }  
      } 
        if(!$(selectors.CART_PAGE_MENU).length){
          setTimeout(function(){        
            Shopify.showModal($(selectors.QUICK_CART_MENU).wrap('<p>').parent().html());
          }, 500);
        }
        Shopify.onCartUpdate(cart);         
      
      };
      /**
 * This updates the N item/items left in your cart
 * 
 * It's setup to match the HTML used to display the Cart Count on Load. If you change that (in your theme.liquid) 
 * you will probably want to change the message html here. 
 * This will update the HTML in ANY element with the class defined in selectors.TOTAL_ITEMS
 *
 * @param object the cart object. 
 * @param HTMLElement form. If included, we know its an Update of the CART FORM, which will trigger additional behaviour. 
 */
      Shopify.onCartUpdate = function(cart, form) {

        // Total Items Update
        var message = cart.item_count;
        if(cart.item_count > 0){
          jQ(selectors.TOTAL_ITEMS).text(message).removeClass('hidden');
        }else{
          jQ(selectors.TOTAL_ITEMS).text('').addClass('hidden');
        }
      };

      Shopify.onError = function(XMLHttpRequest, textStatus) {
        var response = jQuery.parseJSON(XMLHttpRequest.responseText);
        var error = response.description;

        if(typeof $().magnificPopup !== 'function'){ 
          alert(error) ;
        }else{
          $.magnificPopup.open({
            items: {
              src: '<div class="mfp-with-anim modal-popup error"><h3>Error</h3>'+error+'</div>',
              type: 'inline'
            },
            mainClass: 'mfp-move-from-top',
            removalDelay: 1000
          });
        }
      };
      
      $(".cart_tbl").on("focusout","textarea", function(){
        var note = $(this).val(),
            textareas = jQ(selectors.QUICK_CART_MENU).find("textarea");

        Shopify.updateCartNote(note);
      });

      jQuery(".cart_tbl").on("click",".plus_btn", function () {
        var inputEl = jQuery(this).parent().find("input");
        var qty = inputEl.val();

        if (jQuery(this).hasClass("plus_btn"))
          qty++;
        else
          qty--;
        if (qty < 0)
          qty = 0;

        var quantity = qty,
            id = inputEl.data("id");
		
// 		var line = 0;        
//         var $a = $('.cart_wrapper > ul').click(function() {
//           console.log ( $a.index(this) ); 
// 		  line = $a.index(this);
//         });
        var line = $('.cart_wrapper > ul').toArray().indexOf(this.closest("ul")) + 1;
        
        console.log(line);
        
        //var line = $(this).closest("ul").index()+1;
        Shopify.changeItemByLine(line, quantity, function(cart){
          var updatedItem = cart.items.filter(function(item){ return item.variant_id == id });

          var totalUpdatedItemQty = 0;
          
          for(var j=0;j<updatedItem.length;j++){
            totalUpdatedItemQty += updatedItem[j].quantity;
          }
          
          if(updatedItem.length && totalUpdatedItemQty >= quantity){
            Shopify.updateQuickCart(cart);
            inputEl.val(quantity);
          }
          else{
            jQuery('.ajaxcart__item__' + id + '__errors').show().delay(3000).fadeOut();
          }
        });

      })

      jQuery(".cart_tbl").on("click", ".minus_btn", function () {
        var inputEl = jQuery(this).parent().find("input");
        var qty = inputEl.val();
        if (jQuery(this).parent().hasClass("minus_btn"))
          qty++;
        else
          qty--;
        if (qty < 0)
          qty = 0;
        inputEl.val(qty);

        
        
        
        var quantity = qty,
            id = inputEl.data("id");
        if(quantity != 0){
        var line = $(this).closest("ul").index()+1;
        Shopify.changeItemByLine(line, quantity, function(cart){
            Shopify.updateQuickCart(cart);
          });
        }
        else{
          Shopify.removeItem(id, function(cart){
            Shopify.updateQuickCart(cart);
          });
        }
      });

      $(".cart_tbl").on("click",".remove_item_button", function(e){
        e.preventDefault();

        var el = $(this),
            id = el.data('id') || null;

        Shopify.removeItem(id, function(cart){
          Shopify.updateQuickCart(cart);
        });
      });
      
      
      jQuery(".cart_tbl").on("keyup",".number_val_input", function (event) {
        this.value=this.value.replace(/[^0-9]/g, '');  
      });

      jQuery(".cart_tbl").on("change",".number_val_input", function (event) {
        var inputEl = $(this);
        var qty = inputEl.val();

        var quantity = qty.replace(/[^0-9]/g, '');
        id = inputEl.data("id");

        if(quantity > 0){
          var line = $(this).closest("ul").index()+1;
        Shopify.changeItemByLine(line, quantity, function(cart){
          var updatedItem = cart.items.filter(function(item){ return item.variant_id == id });

          var totalUpdatedItemQty = 0;
          
          for(var j=0;j<updatedItem.length;j++){
            totalUpdatedItemQty += updatedItem[j].quantity;
          }
          
          if(updatedItem.length && totalUpdatedItemQty >= quantity){
            Shopify.updateQuickCart(cart);
            inputEl.val(quantity);
          }
            else{
              jQuery('.ajaxcart__item__' + id + '__errors').show().delay(2000).fadeOut();
            }
          });
        }else{
          Shopify.removeItem(id, function(cart){
            Shopify.updateQuickCart(cart);
          });
        }


      });
      
      /// End  Changes for cart page  ///

      //End Wrapper    
    });