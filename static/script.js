window.onload = function(){
	autoGeocode();
}

async function autoGeocode() {
	const city = document.getElementById('city').value;
	const ng   = document.getElementById('neighbourhood_group').value;
	const query = ng ? ng + ', ' + city : city;
	const status = document.getElementById('geo-status');
	status.textContent = '座標を取得中...';
	status.style.color = 'var(--text-sub)';
	try {
		const res = await fetch(
			'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query),
			{ headers: { 'Accept-Language': 'en' } }
		);
		const data = await res.json();
		if (data.length === 0) {
			status.textContent = '座標が見つかりませんでした。';
			status.style.color = 'var(--accent)';
			return;
		}
		document.getElementById('latitude').value  = parseFloat(data[0].lat);
		document.getElementById('longitude').value = parseFloat(data[0].lon);
		status.textContent = '座標取得完了: ' + parseFloat(data[0].lat).toFixed(4) + ', ' + parseFloat(data[0].lon).toFixed(4);
		status.style.color = 'var(--text-sub)';
	} catch (err) {
		status.textContent = '取得失敗: ' + err.message;
		status.style.color = 'var(--accent)';
	}
}

async function geocode() {
	const query = document.getElementById('address_input').value.trim();
	if (!query) return;
	const status = document.getElementById('geo-status');
	const btn = document.getElementById('geo-btn');
	btn.disabled = true;
	status.textContent = '取得中...';
	status.style.color = 'var(--text-sub)';
	try {
		const res = await fetch(
			'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query),
			{ headers: { 'Accept-Language': 'en' } }
		);
		const data = await res.json();
		if (data.length === 0) {
			status.textContent = '住所が見つかりませんでした。';
			status.style.color = 'var(--accent)';
			return;
		}
		const lat = parseFloat(data[0].lat);
		const lon = parseFloat(data[0].lon);
		document.getElementById('latitude').value = lat;
		document.getElementById('longitude').value = lon;
		status.textContent = '取得完了: ' + lat.toFixed(4) + ', ' + lon.toFixed(4);
		status.style.color = 'var(--text-sub)';
	} catch (err) {
		status.textContent = '取得失敗: ' + err.message;
		status.style.color = 'var(--accent)';
	} finally {
		btn.disabled = false;
	}
}

function calcDaysSinceLastReview(dateStr) {
	if (!dateStr) return 9999;
	const last = new Date(dateStr);
	const ref = new Date("2023-12-31");
	const diff = Math.round((ref - last) / (1000 * 60 * 60 * 24));
	return isNaN(diff) ? 9999 : Math.max(0, diff);
}

function getInputs() {
	return {
		neighbourhood_group:            document.getElementById("neighbourhood_group").value,
		latitude:                       parseFloat(document.getElementById("latitude").value) || 0,
		longitude:                      parseFloat(document.getElementById("longitude").value) || 0,
		room_type:                      document.getElementById("room_type").value,
		minimum_nights:                 parseInt(document.getElementById("minimum_nights").value) || 1,
		number_of_reviews:              parseInt(document.getElementById("number_of_reviews").value) || 0,
		reviews_per_month:              parseFloat(document.getElementById("reviews_per_month").value) || 0,
		calculated_host_listings_count: parseInt(document.getElementById("calculated_host_listings_count").value) || 1,
		availability_365:               parseInt(document.getElementById("availability_365").value) || 0,
		number_of_reviews_ltm:          parseInt(document.getElementById("number_of_reviews_ltm").value) || 0,
		city:                           document.getElementById("city").value,
		last_review:                    document.getElementById("last_review").value,
		days_since_last_review:         calcDaysSinceLastReview(document.getElementById("last_review").value),
	};
}

async function runPredict() {
	const btn  = document.getElementById("predict-btn");
	const idle = document.getElementById("result-idle");
	const body = document.getElementById("result-body");

	btn.disabled = true;
	btn.textContent = "予測中...";
	idle.textContent = "";
	idle.className = "loading";
	idle.style.display = "block";
	body.style.display = "none";

	try {
		const res = await fetch("/predict", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(getInputs()),
		});

		const data = await res.json();

		if (!res.ok || data.error) {
			idle.textContent = "エラー: " + (data.error || res.statusText);
			idle.className = "error-msg";
			idle.style.display = "block";
			body.style.display = "none";
			return;
		}

		const inputs  = getInputs();
		const rounded = Math.round(data.price);
		const low     = Math.round(rounded * 0.85);
		const high    = Math.round(rounded * 1.15);

		idle.style.display = "none";
		body.style.display = "block";
		body.innerHTML = `
			<div class="anim">
				<p class="result-price-label">予測料金（1泊）</p>
				<p class="result-price">$${rounded}</p>
				<p class="result-unit">/ night</p>
				<div class="result-range-bar">
					<div class="result-range-fill"></div>
					<div class="result-range-dot"></div>
				</div>
				<div class="result-range-labels">
					<span>$${low}</span><span>±15% 幅</span><span>$${high}</span>
				</div>
				<div class="divider" style="margin:14px 0;"></div>
				<table class="meta-table">
					<tr><td>city</td><td>${inputs.city}</td></tr>
					<tr><td>neighbourhood_group</td><td>${inputs.neighbourhood_group || "—"}</td></tr>
					<tr><td>room_type</td><td>${inputs.room_type}</td></tr>
					<tr><td>minimum_nights</td><td>${inputs.minimum_nights}</td></tr>
					<tr><td>number_of_reviews</td><td>${inputs.number_of_reviews}</td></tr>
					<tr><td>availability_365</td><td>${inputs.availability_365}</td></tr>
					<tr><td>days_since_last_review</td><td>${inputs.days_since_last_review}</td></tr>
				</table>
			</div>`;

	} catch (err) {
		idle.textContent = "通信エラー: " + err.message;
		idle.className = "error-msg";
		idle.style.display = "block";
		body.style.display = "none";
	} finally {
		btn.disabled = false;
		btn.textContent = "料金を予測する →";
	}
}