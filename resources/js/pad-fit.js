function isPadDevice() {
	const userAgent = navigator.userAgent || '';
	const isIPad =
		/iPad/i.test(userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	const isAndroidTablet =
		/Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
	const isTouchOnlyDevice =
		navigator.maxTouchPoints > 0 &&
		window.matchMedia('(pointer: coarse)').matches &&
		window.matchMedia('(hover: none)').matches;

	return isIPad || isAndroidTablet || isTouchOnlyDevice;
}

function shouldFitViewport(vw, vh) {
	return isTabletFitViewport(vw, vh);
}

function isTabletFitViewport(vw, vh) {
	// const minDim = Math.min(vw, vh);

	// 인앱 툴바로 가용 높이가 줄어도 적용되도록 화면 크기 제한을 해제합니다.
	// return isPadDevice() && minDim >= 600;
	return isPadDevice();
}

function getViewportHeight() {
	return window.visualViewport && window.visualViewport.height
		? window.visualViewport.height
		: window.innerHeight;
}

function getHeaderHeight() {
	const header = document.querySelector('.header');
	return header ? header.getBoundingClientRect().height : 60;
}

function fitFontSize() {
	const root = document.documentElement;
	const vw = window.innerWidth;
	const vh = getViewportHeight();
	const base = 10;
	// 화면 배율 축소는 태블릿 기기에서만 적용합니다.
	const minimumScale = 0.65;
	// 고정 px 요소와 브라우저 소수점 반올림으로 생기는 잔여 스크롤을 방지합니다.
	const fitSafetyRatio = 0.90;
	// 태블릿에서는 fp_director 시안(1280 × 970)의 본문 높이를 기준으로 사용합니다.
	const referenceHeaderHeight = 60;
	const referenceContentHeight = 970 - referenceHeaderHeight;

	if (!shouldFitViewport(vw, vh)) {
		const hadFit = root.hasAttribute('data-fp-fitted');
		root.style.removeProperty('font-size');
		root.style.removeProperty('--fp-fit-scale');
		root.style.removeProperty('--fp-viewport-height');
		root.style.removeProperty('--fp-current-header-height');
		root.removeAttribute('data-fp-fitted');
		window.fpFitScale = 1;
		return hadFit;
	}

	const headerHeight = getHeaderHeight();
	const availableHeight = Math.max(vh - headerHeight, 0);
	const scale = Math.max(
		Math.min((availableHeight / referenceContentHeight) * fitSafetyRatio, 1),
		minimumScale,
	);
	const fittedSize = base * scale;

	const nextFontSize = fittedSize.toFixed(3) + 'px';
	const nextScale = scale.toFixed(3);
	if (
		root.style.fontSize === nextFontSize &&
		root.style.getPropertyValue('--fp-fit-scale') === nextScale
	)
		return false;
	root.style.fontSize = nextFontSize;
	root.style.setProperty('--fp-fit-scale', nextScale);
	root.style.setProperty('--fp-viewport-height', vh.toFixed(2) + 'px');
	root.style.setProperty(
		'--fp-current-header-height',
		headerHeight.toFixed(2) + 'px',
	);
	root.setAttribute('data-fp-fitted', '');
	window.fpFitScale = scale;
	return true;
}

let fitFrame;

// head에서 로드되는 즉시 배율을 적용해 첫 화면의 크기 변화를 방지합니다.
fitFontSize();

window.schedulePadFit = function () {
	if (!fitFontSize()) return;

	window.requestAnimationFrame(function () {
		if (!window.Chart || typeof window.Chart.getChart !== 'function') return;
		if (typeof initializeFpCharts === 'function') {
			const page = document.querySelector('.fp_page');
			if (page) {
				initializeFpCharts(page);
				return;
			}
		}
		document.querySelectorAll('canvas').forEach(function (canvas) {
			const chart = window.Chart.getChart(canvas);
			if (chart) chart.resize();
		});
	});
};

window.addEventListener('DOMContentLoaded', window.schedulePadFit);
window.addEventListener('load', window.schedulePadFit);
window.addEventListener('resize', function () {
	window.cancelAnimationFrame(fitFrame);
	fitFrame = window.requestAnimationFrame(window.schedulePadFit);
});

if (window.visualViewport) {
	window.visualViewport.addEventListener('resize', function () {
		window.cancelAnimationFrame(fitFrame);
		fitFrame = window.requestAnimationFrame(window.schedulePadFit);
	});
}
