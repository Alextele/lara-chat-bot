@extends('layouts.app')

@section('header')
    @include('components.header')
@endsection

@section('content')
    <button class="chat-widget__toggle-button show">
        Чат с ботом
        <i class="fas fa-comment-dots float-end"></i>
    </button>
    <div class="row justify-content-center">
        <div class="chat-widget" id="chat-widget">
            <div class="chat-widget__header">
                <div class="chat-widget__title">
                    <i class="fas fa-robot chat-widget__icon"></i>
                    <span class="chat-widget__title-text">Чат с ботом</span>
                </div>
                <div class="chat-header__button-group">
                    <button
                        class="chat-widget__button chat-header__button-compress hidden"
                        title="Уменьшить размер чата"
                    >
                        <i class="fas fa-compress-alt"></i>
                    </button>
                    <button
                        class="chat-widget__button chat-header__button-expand"
                        title="Увеличить размер чата"
                    >
                        <i class="fas fa-expand-alt"></i>
                    </button>
                    <button
                        class="chat-widget__button float-end chat-widget__close_button"
                        title="Закрыть чат с ботом"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="chat-widget__body" id="chat-body">
                <div id="chat-messages" class="chat-widget__messages"></div>
                <div id="chat-loading" class="chat-widget__loading">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                    <span>Загрузка...</span>
                </div>
                <div class="chat-input-group">
                    <label class="visually-hidden" for="chat-input">Чем я могу помочь?</label>
                    <textarea id="chat-input" class="chat-widget__input" placeholder="Чем я могу помочь?"></textarea>
                    <button id="chat-input-submit" class="chat-widget__button chat-widget__button-submit" title="Отправить вопрос боту">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer')
    @include('components.footer')
@endsection

@push('js')
    <script>
        async function sendMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();
            if (!message) return;

            const messages = document.getElementById('chat-messages');
            const loading = document.getElementById('chat-loading');

            messages.innerHTML += `<p class="chat-widget__user-text"><strong>Вы:</strong> ${message}</p>`;
            loading.style.display = 'flex';
            input.disabled = true;

            messages.scrollTop = messages.scrollHeight;

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ message })
                });
                const data = await response.json();
                messages.innerHTML += `<div class="chat-widget__bot-text"><i class="fas fa-robot chat-widget__icon"></i><div class="chat-widget__bot-answer"> ${data.reply}</div></div>`;
                // console.log(data.reply)
            } catch (error) {
                messages.innerHTML += `<p class="chat-widget__bot-text"><strong>Бот:</strong> Ошибка связи с сервером</p>`;
            }

            loading.style.display = 'none';
            input.disabled = false;
            messages.scrollTop = messages.scrollHeight;
            input.value = '';
            input.style.height = 'auto';
            toggleButtonState();
        }

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        const chatInputSubmitButton = document.getElementById('chat-input-submit');
        chatInputSubmitButton.addEventListener("click", sendMessage);
    </script>
    <script>
        const chatModal = {
            chatWidget: document.querySelector(".chat-widget"),
            chatWidgetButton: document.querySelector(".chat-widget__close_button"),
            chatWidgetOpenButton: document.querySelector(
                ".chat-widget__toggle-button"
            ),
        };

        function toggleChat() {
            const chatBody = document.getElementById("chat-widget");
            const toggleButton = document.querySelector(
                ".chat-widget__toggle-button"
            );
            if (chatBody.classList.contains("show")) {
                chatBody.classList.remove("show");
                toggleButton.classList.add("show");
            } else {
                chatBody.classList.add("show");
                toggleButton.classList.remove("show");
            }
        }
        const compressBtn = document.querySelector(
            ".chat-header__button-compress"
        );

        const expandBtn = document.querySelector(".chat-header__button-expand");

        expandBtn.addEventListener("click", function () {
            compressBtn.classList.add("show");
            compressBtn.classList.remove("hidden");
            expandBtn.classList.add("hidden");
            chatModal.chatWidget.classList.add("expand-width");
        });

        compressBtn.addEventListener("click", function () {
            expandBtn.classList.remove("hidden");
            compressBtn.classList.remove("show");
            compressBtn.classList.add("hidden");
            chatModal.chatWidget.classList.remove("expand-width");
        });

        function closeChatOnCloseButton(evt) {
            const chat = evt.target.closest(".chat-widget");

            closeChat(chat);
        }

        function closeChatOnEscape(evt) {
            const chat = document.querySelector(".chat-widget");

            if (evt.key !== "Escape") {
                return;
            }

            closeChat(chat);
        }
        function closePopupOnOverlay(evt) {
            const { target } = evt;

            if (target.closest('.chat-widget') || target.closest('.chat-widget__toggle-button')) {
                return;
            }
            const chatWidget = document.querySelector('.chat-widget');

            closeChat(chatWidget);
        }
        function openChat(chat) {
            const closeButton = chat.querySelector(".chat-widget__close_button");
            chatModal.chatWidgetOpenButton.classList.remove("show");
            chat.classList.add("show");

            closeButton.addEventListener("click", closeChatOnCloseButton);
            document.addEventListener("keydown", closeChatOnEscape);
            document.addEventListener('click', closePopupOnOverlay);
        }

        function closeChat(chat) {
            const closeButton = chat.querySelector(".chat-widget__close_button");

            chat.classList.remove("show");
            chatModal.chatWidgetOpenButton.classList.add("show");

            closeButton.removeEventListener("click", closeChatOnCloseButton);
            document.removeEventListener('click', closePopupOnOverlay);
            document.removeEventListener("keydown", closeChatOnEscape);
        }

        function openChatSearch() {
            openChat(chatModal.chatWidget);
        }

        chatModal.chatWidgetOpenButton.addEventListener("click", openChatSearch);
    </script>
    <script>
        const chatMessages = document.querySelector(".chat-widget__messages");

        function checkEmptyChat() {
            if (chatMessages.children.length === 0) {
                const greetingDiv = document.createElement("div");
                greetingDiv.className = "chat-widget__greeting";
                greetingDiv.textContent =
                    "Я — умный бот помощник. Спросите меня и я постараюсь помочь!";

                chatMessages.parentNode.insertBefore(greetingDiv, chatMessages);
            } else {
                const greeting = document.querySelector(".chat-widget__greeting");
                if (greeting) greeting.remove();
            }
        }

        checkEmptyChat();

        const observer = new MutationObserver(checkEmptyChat);
        observer.observe(chatMessages, { childList: true });
    </script>
    <script>
        const textareaChat = document.getElementById('chat-input');
        textareaChat.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    </script>
    <script>
        const chatInput = document.getElementById('chat-input');
        const chatInputButton = document.getElementById('chat-input-submit');

        function toggleButtonState() {
            chatInputButton.disabled = !chatInput.value.trim();
        }

        chatInput.addEventListener('input', toggleButtonState);

        toggleButtonState();
    </script>
@endpush


