(function () {
	const root = document.documentElement;
	const baseFontSize = 10;
	const minimumScale = 0.7;
	const fitSafetyRatio = 0.98;
	const referenceContentHeight = 910;
	let updateFrame;

	function isPadDevice() {
		const userAgent = navigator.userAgent || '';
		const isIPad =
			/iPad/i.test(userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		const isAndroidTablet =
			/Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
		const isTouchTablet =
			navigator.maxTouchPoints > 0 &&
			window.matchMedia('(pointer: coarse)').matches &&
			window.matchMedia('(hover: none)').matches;

		return isIPad || isAndroidTablet || isTouchTablet;
	}

	function shouldScalePad() {
		const minLayoutDimension = Math.min(window.innerWidth, window.innerHeight);
		return isPadDevice() && minLayoutDimension >= 600;
	}

	function getViewportHeight() {
		return window.visualViewport && window.visualViewport.height
			? window.visualViewport.height
			: window.innerHeight;
	}

	function getHeaderHeight() {
		const header = document.querySelector('.header');
		if (header) return header.getBoundingClientRect().height;

		return window.matchMedia('(max-width: 1023px)').matches ? 105 : 60;
	}

	function resizeCharts() {
		if (!window.Chart || typeof window.Chart.getChart !== 'function') return;

		document.querySelectorAll('canvas').forEach(function (canvas) {
			const chart = window.Chart.getChart(canvas);
			if (chart) chart.resize();
		});
	}

	function updateViewport() {
		const nextHeight = getViewportHeight().toFixed(2) + 'px';
		const previousHeight = root.style.getPropertyValue('--fp-viewport-height');
		const previousFontSize = root.style.fontSize;
		let scale = 1;

		if (shouldScalePad()) {
			const availableHeight = Math.max(
				getViewportHeight() - getHeaderHeight(),
				0,
			);
			scale = Math.max(
				Math.min(
					(availableHeight / referenceContentHeight) * fitSafetyRatio,
					1,
				),
				minimumScale,
			);
			root.style.fontSize = (baseFontSize * scale).toFixed(3) + 'px';
		} else {
			root.style.removeProperty('font-size');
		}

		root.style.setProperty('--fp-viewport-height', nextHeight);
		window.fpFitScale = scale;

		if (
			previousHeight === nextHeight &&
			previousFontSize === root.style.fontSize
		)
			return;

		window.requestAnimationFrame(resizeCharts);
	}

	function scheduleViewportUpdate() {
		window.cancelAnimationFrame(updateFrame);
		updateFrame = window.requestAnimationFrame(updateViewport);
	}

	// 기존 호출부가 있더라도 동일한 viewport 갱신 함수를 사용할 수 있게 유지합니다.
	window.schedulePadFit = scheduleViewportUpdate;

	updateViewport();
	window.addEventListener('DOMContentLoaded', updateViewport);
	window.addEventListener('load', updateViewport);
	window.addEventListener('resize', scheduleViewportUpdate);

	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', scheduleViewportUpdate);
	}
})();
