var colors = {
	primary: '#2865f1',
	green: '#ade060',
	lineGreen: '#45b035',
	warning: '#f2a903',
	gray: '#bababa',
	dark: '#707070',
	text: '#333',
};

/*
 * [개발 제공 데이터]
 * 아래 값은 퍼블리싱 화면 확인용 샘플입니다.
 * 개발에서는 fp_charts.js보다 먼저 같은 구조의 데이터를 선언해 주세요.
 *
 * <script>
 *   window.FP_CHART_DATA = 서버에서 전달한 차트 데이터;
 * </script>
 * <script src="../resources/js/fp_charts.js"></script>
 */
// 퍼블리싱 확인용 FP 차트 샘플 데이터
var sampleData = {
	tenure: {
		labels: ['2~3차월', '4~6차월', '7~12차월', '13~25차월', '25~36차월'],
		rates: [55, 64, 71.2, 78.5, 84],
		benchmarks: [94.5, 80.8, 57.5, 28.8, 15.2],
		label: '정착률',
		benchmarkLabel: '비교 기준',
	},
	monthly: {
		labels: ['25.12', '26.01', '26.02', '26.03', '26.04', '26.05'],
		branch: { label: '강남지원단', values: [100, 9, 10, 17, 0, 15] },
		average: { label: '전체 평균', values: [8, 0, 14, 11, 7, 100] },
	},
	comparison: {
		labels: ['26.04', '26.05', '26.06', '26.07'],
		charts: [
			[145, 260, 270, 147, 165, 123, 147, 213],
			[145, 260, 270, 147, 165, 123, 147, 213],
		],
		comparisonLabel: '본인',
		fpLabel: '평균',
		unit: '천원',
	},
	trends: {
		labels: [
			'25.08',
			'25.09',
			'25.10',
			'25.11',
			'25.12',
			'26.01',
			'26.02',
			'26.03',
			'26.04',
			'26.05',
			'26.06',
			'26.07',
		],
		charts: [ // [260922] type 추가
			{ type: 'percent', values: [81, 80, 79, 83, 80, 100, 84, 78, 82, 86, 83, 0] },
			{ type: 'percent', values: [81, 79, 78, 82, 80, 81, 83, 79, 81, 85, 82, 81] },
			{ type: 'count', values: [78, 81, 80, 82, 79, 83, 82, 84, 81, 85, 84, 86] }, // [260916] 차트 추가
			{ type: 'count', values: [76, 78, 79, 77, 80, 82, 81, 83, 84, 82, 85, 84] },
			{ type: 'count', values: [82, 83, 81, 84, 85, 83, 86, 84, 87, 86, 88, 87] },
			{ type: 'count', values: [79, 77, 80, 81, 78, 82, 83, 81, 84, 85, 83, 86] },
		],
	},
	productRatio: {
		labels: ['종신상품', '건강상품', '순수건강상품', '기타상품'],
		values: [54, 82, 23, 34],
		benchmarks: [60, 42, 78, 31],
		label: '상품군 계약 비중',
	},
	demographics: {
		age: {
			labels: ['20대', '30대', '40대', '50대', '60대+'],
			recruit: [62.5, 82.6, 34.2, 25.4, 24.3],
			transfer: [48.3, 61.4, 74.1, 21.8, 19.6],
		},
		job: {
			labels: ['주부', '회사원', '학생', '자영업', '기타'],
			recruit: [62.6, 82.5, 34.4, 34.6, 25.5],
			transfer: [48.4, 61.1, 80.7, 80.4, 21.2],
		},
	},
};

// 기존 차트를 제거하고 새 Chart.js 차트를 생성합니다.
function createChart(canvas, config) {
	if (!canvas || !window.Chart) return;
	var currentChart = window.Chart.getChart(canvas);
	if (currentChart) currentChart.destroy();
	new window.Chart(canvas, config);
}

// 모든 FP 차트가 공유하는 Chart.js 기본 옵션
function baseOptions() {
	return {
		responsive: true,
		maintainAspectRatio: false,
		animation: false,
		color: colors.text,
		interaction: { mode: 'nearest', intersect: true },
		plugins: {
			legend: { display: false },
			tooltip: {
				enabled: true,
				displayColors: false,
				position: 'nearest',
				backgroundColor: '#333',
				titleColor: '#fff',
				bodyColor: '#fff',
				footerColor: '#fff',
				padding: 10,
				titleFont: { family: 'Malgun Gothic', size: 12 },
				bodyFont: { family: 'Malgun Gothic', size: 12 },
			},
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: {
					font: { family: 'Malgun Gothic', size: 14 },
				},
			},
			y: {
				beginAtZero: true,
				border: { display: false },
				grid: { display: false },
				ticks: { display: false },
			},
		},
	};
}

function drawValueWithUnit(context, value, unit, x, y, gap) {
	context.font = '600 14px Malgun Gothic';
	context.textAlign = 'right';
	context.fillText(value, x, y);
	context.font = '400 13px Malgun Gothic';
	context.textAlign = 'left';
	context.fillText(unit, x + (gap || 0), y);
}

// 막대/라인 차트의 데이터 값을 차트 위에 표시하는 플러그인 // [260922]
function valueLabels(datasetIndex, unit, separateUnit) {
	unit = unit || '%';
	return {
		id: 'fpValueLabels',
		afterDatasetsDraw: function (chart) {
			var meta = chart.getDatasetMeta(datasetIndex);
			if (!meta || meta.hidden) return;
			var values = chart.data.datasets[datasetIndex].data;
			var context = chart.ctx;
			context.save();
			context.fillStyle = colors.text;
			context.font = '600 14px Malgun Gothic';
			context.textAlign = 'center';
			context.textBaseline = 'bottom';
			$.each(meta.data, function (index, point) {
				if (values[index] == null) return;
				if (separateUnit) {
					drawValueWithUnit(context, values[index], unit, point.x, point.y - 5);
				} else {
					context.fillText(values[index] + unit, point.x, point.y - 5);
				}
			});
			context.restore();
		},
	};
}

// 수수료/총환산 차트의 툴팁 정보를 막대 위에 표시하는 플러그인 [260915]
function comparisonValueLabels(unit) {
	return {
		id: 'fpComparisonValueLabels',
		afterDatasetsDraw: function (chart) {
			var context = chart.ctx;
			context.save();
			context.fillStyle = colors.text;
			context.textBaseline = 'bottom';
			$.each(chart.data.datasets, function (datasetIndex, dataset) {
				$.each(chart.getDatasetMeta(datasetIndex).data, function (index, bar) {
					var value = dataset.data[index].toLocaleString();
					drawValueWithUnit(context, value, unit, bar.x, bar.y - 5, 2);
				});
			});
			context.restore();
		},
	};
}

function horizontalValueLabels() {
	return {
		id: 'fpHorizontalValueLabels',
		afterDatasetsDraw: function (chart) {
			var context = chart.ctx;
			context.save();
			context.fillStyle = colors.text;
			context.font = '600 14px Malgun Gothic';
			context.textAlign = 'right';
			context.textBaseline = 'middle';
			$.each(chart.data.datasets, function (datasetIndex, dataset) {
				var meta = chart.getDatasetMeta(datasetIndex);
				if (!meta || meta.hidden) return;
				$.each(meta.data, function (index, bar) {
					context.fillText(
						dataset.data[index] + ' %',
						chart.width - 16,
						bar.y,
					);
				});
			});
			context.restore();
		},
	};
}

// 상품군 계약 비중 차트의 기준선과 값을 표시하는 플러그인
function productLabels() {
	return {
		id: 'fpProductLabels',
		afterDraw: function (chart) {
			var context = chart.ctx;
			var yScale = chart.scales.y;
			context.save();
			context.fillStyle = colors.text;
			context.font = '14px Malgun Gothic';
			context.textAlign = 'right';
			context.textBaseline = 'middle';
			$.each(chart.data.labels, function (index, label) {
				context.fillText(label, yScale.right - 20, yScale.getPixelForTick(index));
			});
			context.restore();
		},
	};
}

function productBenchmarks(benchmarks) {
	return {
		id: 'fpProductBenchmarks',
		beforeDatasetsDraw: function (chart) {
			var context = chart.ctx;
			var xScale = chart.scales.x;
			context.save();
			context.fillStyle = '#e7e7e7';
			$.each(chart.getDatasetMeta(0).data, function (index, bar) {
				context.fillRect(
					xScale.getPixelForValue(0),
					bar.y - 12,
					xScale.getPixelForValue(100) - xScale.getPixelForValue(0),
					24,
				);
			});
			context.restore();
		},
		afterDatasetsDraw: function (chart) {
			var context = chart.ctx;
			var xScale = chart.scales.x;
			context.save();
			context.font = '600 14px Malgun Gothic';
			context.textAlign = 'right';
			context.textBaseline = 'middle';
			$.each(chart.getDatasetMeta(0).data, function (index, bar) {
				var markerX = xScale.getPixelForValue(benchmarks[index]);
				context.fillStyle = '#236b2c';
				context.fillRect(markerX - 1.5, bar.y - 13, 3, 26);
				context.fillStyle = colors.text;
				context.fillText(
					chart.data.datasets[0].data[index] + ' %',
					chart.width - 28,
					bar.y,
				);
			});
			context.restore();
		},
	};
}

// 차트 하단 기준선을 전체 너비로 이어 보이게 하는 플러그인
var extendedXAxis = {
	id: 'fpExtendedXAxis',
	beforeDatasetsDraw: function (chart) {
		var context = chart.ctx;
		context.save();
		context.beginPath();
		context.moveTo(0, chart.chartArea.bottom + 0.5);
		context.lineTo(chart.width, chart.chartArea.bottom + 0.5);
		context.lineWidth = 1;
		context.strokeStyle = '#e0e5eb';
		context.stroke();
		context.restore();
	},
};

// 활동기간별 정착 현황 차트
function drawTenureChart(root, data) {
	var $canvas = $(root).find('#fpTenureChart');
	if (!$canvas.length || !data) return;
	var options = baseOptions();
	options.layout = { padding: { top: 36, right: 20, left: 40 } };
	options.scales.y.max = 100;
	options.scales.x.offset = true;
	options.scales.x.border = { display: false };
	options.plugins.tooltip.callbacks = {
		label: function (context) {
			return context.dataset.label + ': ' + context.parsed.y + '%';
		},
		afterBody: function (items) {
			return (
				data.benchmarkLabel + ': ' + data.benchmarks[items[0].dataIndex] + '%'
			);
		},
	};
	createChart($canvas[0], {
		type: 'bar',
		data: {
			labels: data.labels,
			datasets: [
				{
					label: data.label,
					data: data.rates,
					backgroundColor: $.map(data.rates, function (value, index) {
						return value >= data.benchmarks[index]
							? colors.primary
							: colors.warning;
					}),
					borderRadius: 4,
					maxBarThickness: 40,
				},
			],
		},
		plugins: [valueLabels(0), extendedXAxis],
		options: options,
	});
}

// 최근 6개월 우선코칭 비율 현황 차트
function drawMonthlyChart(root, data) {
	var $canvas = $(root).find('#fpMonthlyChart');
	if (!$canvas.length || !data) return;
	var monthlyValues = data.branch.values.concat(data.average.values);
	var minValue = Math.min.apply(null, monthlyValues);
	var maxValue = Math.max.apply(null, monthlyValues);
	var rangePadding = Math.max(5, (maxValue - minValue) * 0.1);
	var options = baseOptions();
	options.layout = { padding: { top: 20, right: 20, bottom: 10, left: 20 } };
	options.scales.x.border = { display: false };
	options.scales.y.suggestedMax = 22;
	if (minValue <= 0) options.scales.y.min = minValue - rangePadding;
	if (maxValue >= 100) options.scales.y.max = maxValue + rangePadding;
	options.plugins.tooltip.callbacks = {
		label: function (context) {
			return context.dataset.label + ': ' + context.parsed.y + '%';
		},
	};
	createChart($canvas[0], {
		type: 'line',
		data: {
			labels: data.labels,
			datasets: [
				{
					label: data.branch.label,
					data: data.branch.values,
					borderColor: colors.lineGreen,
					backgroundColor: colors.lineGreen,
					borderWidth: 2.5,
					pointStyle: 'rect',
					pointRadius: 3,
					pointHoverRadius: 5,
					tension: 0.32,
				},
				{
					label: data.average.label,
					data: data.average.values,
					borderColor: colors.dark,
					backgroundColor: colors.dark,
					borderWidth: 2,
					borderDash: [5, 4],
					pointRadius: 3,
					pointHoverRadius: 5,
					tension: 0.32,
				},
			],
		},
		plugins: [valueLabels(0), extendedXAxis],
		options: options,
	});
}

// 상세분석의 전월/동일 차월군 대비 막대 차트
function drawComparisonCharts(root, data) {
	if (!data) return;
	$.each(
		['fpCommissionChart', 'fpConversionChart'],
		function (index, chartId) {
			var canvas = $(root).find('#' + chartId)[0];
			var values = data.charts[index];
			if (!canvas) return;
			if (!values || values.length !== 8) return;
			var options = baseOptions();
			options.layout = { padding: { top: 24 } }; //[260915]
			options.plugins.tooltip.callbacks = {
				label: function (context) {
					return (
						context.dataset.label +
						': ' +
						context.parsed.y.toLocaleString() +
						data.unit
					);
				},
			};
			createChart(canvas, {
				type: 'bar',
				data: {
					labels: data.labels,
					datasets: [
						{
							label: data.comparisonLabel,
							data: [values[0], values[2], values[4], values[6]],
							backgroundColor: colors.green,
							borderRadius: 4,
							maxBarThickness: 28,
						},
						{
							label: data.fpLabel,
							data: [values[1], values[3], values[5], values[7]],
							backgroundColor: colors.primary,
							borderRadius: 4,
							maxBarThickness: 28,
						},
					],
				},
				plugins: [comparisonValueLabels(data.unit)], //[260915]
				options: options,
			});
		},
	);
}

// 상세분석의 오전교육 참여율/귀사율 추이 차트 [260916] 차트 추가 // [260916_1] 파라미터 추가 수정
function drawTrendCharts(root, data, chartIds) {
	if (!data || !data.charts || !data.charts.length) return;
	chartIds = chartIds || [
		'fpEducationTrendChart',
		'fpReturnTrendChart',
		'fpEducationTrendChart2',
		'fpReturnTrendChart2',
		'fpEducationTrendChart3',
		'fpReturnTrendChart3',
	];
	if (typeof chartIds === 'string') chartIds = [chartIds];
	$.each(
		chartIds,
		function (index, chartId) {
			var canvas = $(root).find('#' + chartId)[0];
			var chartIndex = index % data.charts.length;
			var chartData = data.charts[chartIndex];
			var values = chartData && chartData.values;
			if (!canvas || !values) return;
			var minValue = Math.min.apply(null, values);
			var maxValue = Math.max.apply(null, values);
			var unit = chartData.type === 'count' ? '건' : '%';
			var options = baseOptions();
			options.layout = { padding: { top: 18, right: 26, left: 6 } };
			// 상세분석의 모든 추이 차트 날짜 글꼴/색상: 각 데이터 지점 아래에 표시
			options.scales.x.ticks = {
				autoSkip: false,
				maxRotation: 45,
				minRotation: 0,
				color: '#333',
				font: { family: 'Malgun Gothic', size: 14 },
			};
			options.scales.x.border = { display: true, color: '#dfe5eb', width: 1 };
			options.scales.y.beginAtZero = false;
			options.scales.y.suggestedMin = 70;
			options.scales.y.suggestedMax = 90;
			if (minValue <= 0) options.scales.y.min = minValue - 30;
			if (maxValue >= 100) options.scales.y.max = maxValue + 30;
			options.plugins.tooltip.callbacks = {
				label: function (context) {
					return context.parsed.y + unit;
				},
			};
			createChart(canvas, {
				type: 'line',
				data: {
					labels: data.labels,
					datasets: [
						{
							label: canvas.getAttribute('aria-label') || '추이',
							data: values,
							borderColor: colors.lineGreen,
							backgroundColor: 'transparent',
							pointBackgroundColor: colors.lineGreen,
							pointBorderColor: colors.lineGreen,
							borderWidth: 2,
							pointRadius: 2.5,
							pointHoverRadius: 5,
							tension: 0.3,
							fill: false,
						},
					],
				},
				plugins: [valueLabels(0, unit, true)],
				options: options,
			});
		},
	);
}

// 속성분석의 상품군 계약 비중 차트 //[260917]
function drawAttributeCharts(root, productData) {
	var $ratioCanvas = $(root).find('#fpProductRatioChart');
	if ($ratioCanvas.length && productData) {
		var ratioOptions = baseOptions();
		ratioOptions.indexAxis = 'y';
		// 막대 끝과 우측 % 값 사이의 간격을 좁힙니다.
		ratioOptions.layout = { padding: { left: 14, right: 80 } };
		ratioOptions.scales.x.min = 0;
		ratioOptions.scales.x.max = 100;
		ratioOptions.scales.x.display = false;
		ratioOptions.scales.y.grid = { display: false };
		ratioOptions.scales.y.border = { display: false };
		ratioOptions.scales.y.ticks = {
			align: 'start',
			crossAlign: 'near',
			color: 'transparent',
			font: { family: 'Malgun Gothic', size: 14 },
		};
		ratioOptions.scales.y.afterFit = function (scale) {
			scale.width = 118;
		};
		ratioOptions.plugins.tooltip.callbacks = {
			label: function (context) {
				return context.parsed.x + '%';
			},
		};
		createChart($ratioCanvas[0], {
			type: 'bar',
			data: {
				labels: productData.labels,
				datasets: [
					{
						label: productData.label,
						data: productData.values,
						backgroundColor: colors.green,
						hoverBackgroundColor: colors.green,
						borderRadius: 4,
						barThickness: 24,
					},
				],
			},
			plugins: [productLabels(), productBenchmarks(productData.benchmarks)],
			options: ratioOptions,
		});
	}
}

// 속성분석의 고객 구분 차트 //[260917]
function drawDemographCharts(root, demographicData) {
	$.each(
		[
			{ id: 'fpAgeChart', type: 'age' },
			{ id: 'fpJobChart', type: 'job' },
		],
		function (_, chartInfo) {
			var canvas = $(root).find('#' + chartInfo.id)[0];
			var data = demographicData && demographicData[chartInfo.type];
			if (!canvas || !data) return;
			var options = baseOptions();
			options.indexAxis = 'y';
			options.layout = { padding: { right: 80 } };
			options.scales.x.min = 0;
			options.scales.x.max = 100;
			options.scales.x.display = false;
			options.scales.y.grid = { display: false };
			options.scales.y.border = { display: true, color: '#dfe5eb', width: 1 };
			options.scales.y.ticks = {
				color: colors.text,
				font: { family: 'Malgun Gothic', size: 14 },
			};
			options.plugins.tooltip.callbacks = {
				label: function (context) {
					return context.dataset.label + ': ' + context.parsed.x + '%';
				},
			};
			createChart(canvas, {
				type: 'bar',
				data: {
					labels: data.labels,
					datasets: [
						{
							label: '모집',
							data: data.recruit,
							backgroundColor: colors.primary,
							hoverBackgroundColor: colors.primary,
							borderRadius: 4,
							categoryPercentage: 0.9,
							barPercentage: 0.4,
							maxBarThickness: 8,
						},
						{
							label: '전입',
							data: data.transfer,
							backgroundColor: colors.green,
							hoverBackgroundColor: colors.green,
							borderRadius: 4,
							categoryPercentage: 0.9,
							barPercentage: 0.4,
							maxBarThickness: 8,
						},
					],
				},
				plugins: [horizontalValueLabels()],
				options: options,
			});
		},
	);
}

/* [UI 초기화] 개발 데이터가 준비된 뒤 두 번째 인자로 직접 전달해도 됩니다. */
// 현재 FP 화면에 있는 차트를 한 번에 초기화합니다.
// [260916_1] 파라미터 추가
function initializeFpCharts(root, chartData, trendChartIds) {
	if (!root || !window.Chart) return;
	var data = chartData || window.FP_CHART_DATA || sampleData;
	drawTenureChart(root, data.tenure);
	drawMonthlyChart(root, data.monthly);
	drawComparisonCharts(root, data.comparison);
	drawTrendCharts(root, data.trends, trendChartIds);
	drawAttributeCharts(root, data.productRatio); //[260917]
	drawDemographCharts(root, data.demographics); //[260917]
}

$(function () {
	var page = document.querySelector('.fp_page');
	if (page) initializeFpCharts(page);
});
