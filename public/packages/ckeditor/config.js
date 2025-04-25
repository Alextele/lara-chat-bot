/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html

    config.disallowedContent = 'img{width,height,border*,cke-xyz};script;*[on*];hr;style';
    config.codemirror = {
        theme:'dracula',
        lang:'ru',
    };
    config.toolbarCanCollapse = true;
    config.extraPlugins = ['embed','widget','typograf','codemirror','div','justify','showblocks','find', 'copyformatting', 'html5video'];

    config.toolbar = [
        { name: 'document', items: [ 'Source', '-','CommentSelectedRange','UncommentSelectedRange'] },
        { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord'] },
        { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', ] },
        { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
        '/',
        { name: 'insert', items: [ 'Image','Table' ,  'Iframe','Embed' ] },  { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },

        { name: 'paragraph', items: [ 'NumberedList', 'BulletedList','Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },


        '/',
        { name: 'styles', items: ['Typograf','Format', 'Styles' ,'-','CopyFormatting', 'RemoveFormat'] },{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Subscript', 'Superscript','SpecialChar', '-',  ] },

    ];

      //  config.removeButtons = 'CodemirrorAbout,About,Flash,HorizontalRule,Smiley,PageBreak,Strike,Underline,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Font,FontSize,Outdent,Indent,JustifyBlock,BidiLtr,BidiRtl,Language,TextColor,BGColor';

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.

	// Set the most common block elements.
    config.extraAllowedContent = '*[id]; *(*); table[data-*]; thead; iframe[*]; tbody; tr; th[scope,data-*]; td; div[itemscope,itemtype,itemprop]; span[itemscope,itemtype,itemprop]; a[itemscope,itemtype,itemprop]; p[itemscope,itemtype,itemprop]; td[itemscope,itemtype,itemprop]; tr[itemscope,itemtype,itemprop]; table[itemscope,itemtype,itemprop]; section; source[itemscope,itemtype,itemprop]; th[itemscope,itemtype,itemprop]; video; i[*]{*}(*); button';//не убирать классы и id
    config.format_tags = "p;h2;h3;h4;h5;h6;pre;address;div";
    config.allowedContent = false;

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';

    config.autoParagraph = false;


    CKEDITOR.on('instanceReady', function(ev) {
        // Ends self closing tags the XHTML way, like <br />.
        ev.editor.dataProcessor.writer.selfClosingEnd = '>';
    });
};

$(document).ready(function () {
    CKEDITOR.on('instanceReady', function () {
        let $form = $('form');

        $form.off('submit.preprocess').on('submit.preprocess', function () {
            for (let instanceName in CKEDITOR.instances) {
                if (CKEDITOR.instances.hasOwnProperty(instanceName)) {
                    let editor = CKEDITOR.instances[instanceName];
                    // 1. Получаем текущее значение
                    let rawData = editor.getData();

                    // 2. Создаём фрагмент из HTML
                    let fragment = CKEDITOR.htmlParser.fragment.fromHtml(rawData);

                    // 3. Применяем фильтрацию
                    editor.filter.applyTo(fragment);

                    // 4. Сериализуем обратно в HTML
                    let writer = new CKEDITOR.htmlWriter();
                    fragment.writeHtml(writer);
                    let filtered = writer.getHtml();

                    // 5. Подменяем значение поля вручную
                    editor.setData(filtered, function () {
                        editor.updateElement();
                    });
                }
            }
        });
    });
});




