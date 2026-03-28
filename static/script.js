function getInputs() {
    return {
      host_id:                          parseInt(document.getElementById('host_id').value) || 0,
      neighbourhood_group:              document.getElementById('neighbourhood_group').value.trim(),
      neighbourhood:                    document.getElementById('neighbourhood').value.trim(),
      latitude:                         parseFloat(document.getElementById('latitude').value) || 0,
      longitude:                        parseFloat(document.getElementById('longitude').value) || 0,
      room_type:                        document.getElementById('room_type').value,
      minimum_nights:                   parseInt(document.getElementById('minimum_nights').value) || 1,
      number_of_reviews:                parseInt(document.getElementById('number_of_reviews').value) || 0,
      last_review:                      document.getElementById('last_review').value.trim(),
      reviews_per_month:                parseFloat(document.getElementById('reviews_per_month').value) || 0,
      calculated_host_listings_count:   parseInt(document.getElementById('calculated_host_listings_count').value) || 1,
      availability_365:                 parseInt(document.getElementById('availability_365').value) || 0,
      number_of_reviews_ltm:            parseInt(document.getElementById('number_of_reviews_ltm').value) || 0,
      city:                             document.getElementById('city').value,
    };
  }

  function runPredict() {
    const inputs = getInputs();
    const price = predict(inputs);
    const idle = document.getElementById('result-idle');
    const body = document.getElementById('result-body');

    if (price === null || price === undefined || isNaN(price)) {
      idle.textContent = 'predict() が null を返しました。ロジックを実装してください。';
      idle.style.display = 'block';
      body.style.display = 'none';
      return;
    }

    const rounded = Math.round(price);
    const low = Math.round(rounded * 0.85);
    const high = Math.round(rounded * 1.15);

    idle.style.display = 'none';
    body.style.display = 'block';
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
          <tr><td>neighbourhood</td><td>${inputs.neighbourhood || '—'}</td></tr>
          <tr><td>room_type</td><td>${inputs.room_type}</td></tr>
          <tr><td>minimum_nights</td><td>${inputs.minimum_nights}</td></tr>
          <tr><td>number_of_reviews</td><td>${inputs.number_of_reviews}</td></tr>
          <tr><td>availability_365</td><td>${inputs.availability_365}</td></tr>
        </table>
      </div>`;
  }

  // =====================================================
  // predict(inputs) を実装してください
  //
  // inputs のキーは Kaggle "US Airbnb Open Data" の
  // カラム名と完全一致:
  //
  //   host_id                        : number
  //   neighbourhood_group            : string  (空の場合あり)
  //   neighbourhood                  : string
  //   latitude                       : number
  //   longitude                      : number
  //   room_type                      : string  "Entire home/apt" | "Private room" | "Shared room" | "Hotel room"
  //   minimum_nights                 : number
  //   number_of_reviews              : number
  //   last_review                    : string  "YYYY-MM-DD"
  //   reviews_per_month              : number
  //   calculated_host_listings_count : number
  //   availability_365               : number
  //   number_of_reviews_ltm          : number
  //   city                           : string
  //
  // 戻り値: 数値（1泊あたりの予測価格 USD）または null
  // =====================================================
  function predict(inputs) {
    return null;
  }