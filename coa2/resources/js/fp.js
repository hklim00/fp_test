// [FP UI 초기화] 화면 진입 시 필요한 FP UI를 실행합니다.
let fpToastTimer;

function initializeFp() {
	$(document).off('.fp');
	fpSearch();
	fpHelp();
	fpTarget();
	fpModal();
	fpTextarea();
	fpSegment();
	fpAnalysisTabs(); //[260911]
	fpOutsideClick();
}

// 검색 목록 UI
function fpSearch() {
	$(document).on('click.fp', '.fp_search_input', function () {
		const $search = $(this).closest('.fp_content_search');
		const isOpen = $search.find('.fp_search_list').hasClass('open');

		fpSearchClose();
		if (!isOpen) fpSearchToggle($search, true);
	});

	$(document).on('click.fp', '.fp_search_list button', fpSearchClose);

	$(document).on('keydown.fp', '.fp_search_input', function (event) {
		if ( $(this).val() ?? '' === '')	fpSearchToggle($(this).closest('.fp_content_search'), false);
		if (event.key !== 'Escape') return;
		fpSearchToggle($(this).closest('.fp_content_search'), false);
		this.blur();
	});
}

function fpSearchToggle($search, isOpen) {
	var $list = $search.find('.fp_search_list');
	var hasItems = $list.find('li').length > 0 ;
	var open = isOpen && hasItems;

	$search.find('.fp_search_list').toggleClass('open', open);
	$search.find('.fp_search_input').attr('aria-expanded', String(open));
}

function fpSearchClose() {
	$('.fp_content_search').each(function () {
		fpSearchToggle($(this), false);
	});
}

// 도움말 툴팁 UI
function fpHelp() {
	$(document).on('click.fp', '.fp_help_btn', function () {
		const $tooltip = $(this).siblings('.fp_tooltip');
		const isOpen = $tooltip.hasClass('open');

		fpHelpClose();
		$tooltip.toggleClass('open', !isOpen);
		if (!isOpen) fpHelpPosition($tooltip);
	});
}

function fpHelpPosition($tooltip) {
	const screenGap = 16;
	const screenWidth = document.documentElement.clientWidth;
	let box;
	let move = 0;

	$tooltip.css({
		'--fp-tooltip-move': '0px',
		'--fp-tooltip-arrow-move': '0px',
	});
	box = $tooltip[0].getBoundingClientRect();

	if (box.left < screenGap) move = screenGap - box.left;
	if (box.right > screenWidth - screenGap) {
		move = screenWidth - screenGap - box.right;
	}

	$tooltip.css({
		'--fp-tooltip-move': move + 'px',
		'--fp-tooltip-arrow-move': -move + 'px',
	});
}

function fpHelpClose() {
	$('.fp_tooltip').removeClass('open');
}

// 대상자 보기 목록 UI
function fpTarget() {
	$(document).on('click.fp', '.fp_target_btn', function () {
		const $list = $(this).next('.fp_target_list');
		const isOpen = !$list.prop('hidden');

		fpTargetClose();
		$list.prop('hidden', isOpen);
	});

	$(document).on('click.fp', '.fp_target_list button', fpTargetClose);
}

function fpTargetClose() {
	$('.fp_target_list').prop('hidden', true);
}

// ID로 모달을 엽니다. 버튼의 data-modal 값 또는 fpOpenModal('모달ID')로 호출합니다.
function fpOpenModal(modalId) {
	const id = String(modalId || '').replace(/^#/, '');
	const $modal = $('#' + id);
	if (!$modal.length || !$modal.hasClass('fp_modal')) return;

	const $openedModals = $('.fp_modal:visible');
	$openedModals.attr('aria-hidden', 'true');
	$modal.data('fp-modal-trigger', document.activeElement);
	$modal.prop('hidden', false);
	$modal.css('z-index', 2000 + $openedModals.length * 10);
	$('body').addClass('fp_modal_open');

	window.setTimeout(function () {
		$modal.find('.fp_modal_close, button, [href], input, textarea, [tabindex]:not([tabindex="-1"])').first().trigger('focus');
	}, 0);
}

// 모달 요소 또는 ID로 모달을 닫습니다.
function fpCloseModal(modal) {
	const $modal = typeof modal === 'string' ? $('#' + modal.replace(/^#/, '')) : $(modal);
	const trigger = $modal.data('fp-modal-trigger');

	$modal.prop('hidden', true).removeAttr('aria-hidden').css('z-index', '');
	const $remainingModals = $('.fp_modal:visible');
	if ($remainingModals.length) {
		const $topModal = fpGetTopModal().removeAttr('aria-hidden');
		if (trigger && document.documentElement.contains(trigger)) {
			$(trigger).trigger('focus');
		} else {
			$topModal.find('.fp_modal_close, button, [href], input, textarea, [tabindex]:not([tabindex="-1"])').first().trigger('focus');
		}
	} else {
		$('body').removeClass('fp_modal_open');
		if (trigger && document.documentElement.contains(trigger)) $(trigger).trigger('focus');
	}
}

// 단일·이중 모달에서 가장 높은 z-index를 가진 최상단 활성 모달을 반환합니다.
// ESC로 닫을 대상과 하위 모달을 닫은 뒤 복원할 모달을 결정할 때 사용합니다.
function fpGetTopModal() {
	let $topModal = $();
	let topZIndex = -1;

	$('.fp_modal:visible').each(function () {
		const zIndex = parseInt($(this).css('z-index'), 10) || 0;
		if (zIndex >= topZIndex) {
			topZIndex = zIndex;
			$topModal = $(this);
		}
	});

	return $topModal;
}

// 모달 UI
function fpModal() {
	$(document).on('click.fp', '[data-modal]', function () {
		fpOpenModal($(this).attr('data-modal'));
	});

	$(document).on('click.fp', '[data-modal-close]', function () {
		fpCloseModal($(this).closest('.fp_modal'));
	});

	$(document).on('click.fp', '.fp_modal', function (event) {
		if (event.target === this) fpCloseModal(this);
	});

	$(document).on('keydown.fp', fpModalKeydown);
}

function fpModalKeydown(event) {
	if (event.key !== 'Escape') return;
	const $modal = fpGetTopModal();
	if ($modal.length) fpCloseModal($modal);
}

// textarea 글자 수 및 버튼 상태
function fpTextarea() {
	$('.fp_count_textarea').each(function () {
		fpUpdateTextarea(this);
	});

	$(document).on('input.fp', '.fp_count_textarea', function () {
		fpUpdateTextarea(this);
	});
}

function fpUpdateTextarea(textarea) {
	const $textarea = $(textarea);
	const length = String($textarea.val() || '').length;
	const $modal = $textarea.closest('.fp_modal');

	$modal.find('.fp_char_count b').text(length.toLocaleString());
}

// 세그먼트 버튼 UI
function fpSegment() {
	$(document).on('click.fp', '.fp_segmented_control button', function () {
		$(this)
			.addClass('active')
			.attr('aria-pressed', 'true')
			.siblings('button')
			.removeClass('active')
			.attr('aria-pressed', 'false');
	});
}

// FP 분석 탭 UI [260911]
function fpAnalysisTabs() {
	$(document).on('click.fp', '.fp_analysis_tabs a', function () {
		$(this).addClass('active').siblings('a').removeClass('active');
	});
}

// toast [260916_2] 메세지값 추가
function showToast(message) {
	const $toast = $('.fp_toast').first(); // [260909]
	if (!$toast.length) return;

	window.clearTimeout(fpToastTimer);
	if (message != null) $toast.text(message);
	$toast.prop('hidden', false).addClass('show');

	fpToastTimer = window.setTimeout(function () {
		$toast.removeClass('show').prop('hidden', true);
		fpToastTimer = undefined;
	}, 2200);
}

// 열려 있는 UI를 영역 밖 클릭 시 닫습니다.
function fpOutsideClick() {
	$(document).on('click.fp', function (event) {
		const $target = $(event.target);

		if (!$target.closest('.fp_content_search').length) fpSearchClose();
		if (!$target.closest('.fp_help_wrap').length) fpHelpClose();
		if (!$target.closest('.fp_target_wrap').length) fpTargetClose();
	});
}

$(initializeFp);
