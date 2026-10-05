export function renderHome({card,pById,categories,categoryTile,faq}) {
 return `
<section class="hero" aria-labelledby="hero-title">
 <div class="hero-copy">
  <span class="eyebrow"><span class="brand-line"></span> TREEBITES · EVERYDAY FOOD & NUTRITION</span>
  <h1 id="hero-title">Goodness.<br><span>On repeat.</span></h1>
  <p>Crunch into seeds. Stir in a little tradition.<br>Find the good stuff for your everyday.</p>
  <div class="hero-actions"><a class="button" href="/products/">Find your good</a><a class="text-link" href="/categories/">Explore the range</a></div>
  <div class="hero-bottom"><span><strong>20</strong> ways to find your favourite</span><span>Seeds. Staples.<br>Sips. And more.</span></div>
 </div>
 <div class="hero-visual">
  <div class="hero-stamp"><span>THE EVERYDAY</span><strong>good stuff.</strong><span>BY TREEBITES</span></div>
  <div class="hero-pack"><img src="/assets/TB-05-pack.png" alt="TreeBites Healthy Mix with pumpkin, sunflower, flax and sesame seeds" width="1000" height="1000" fetchpriority="high"></div>
  <span class="hero-side-note">GOODNESS IN EVERY SPRINKLE</span>
  <a class="hero-product" href="/products/healthy-mix/"><div><span class="eyebrow">FOUR SEEDS. SO MANY POSSIBILITIES.</span><h2>Meet Healthy Mix.</h2></div><span class="hero-pack-size">200 g</span></a>
 </div>
</section>
<div class="brand-strip" aria-label="The TreeBites range"><span>SEEDS WITH CRUNCH</span><b aria-hidden="true">✳</b><span>STAPLES WITH SOUL</span><b aria-hidden="true">✳</b><span>SIPS WITH A TWIST</span><b aria-hidden="true">✳</b><span>EVERYDAY TREEBITES</span></div>
<section class="section favourites-section">
 <div class="section-heading"><div><span class="eyebrow">YOUR PANTRY, WITH PERSONALITY</span><h2>Small additions.<br><span class="accent-text">Big possibilities.</span></h2></div><div class="section-aside"><p>Meet the ingredients you’ll keep coming back to.</p><a class="text-link" href="/products/">Explore all 20 products</a></div></div>
 <div class="product-grid featured-grid">${['TB-15','TB-12','TB-05','TB-17'].map(id=>card(pById(id))).join('')}</div>
</section>
<section class="category-section"><div class="section">
 <div class="section-heading"><div><span class="eyebrow">FIVE WAYS TO FIND YOUR GOOD</span><h2>What’s your<br>kind of <span class="accent-text">good?</span></h2></div><a class="text-link" href="/categories/">Meet the whole family</a></div>
 <div class="category-grid">${categories.map(categoryTile).join('')}</div>
</div></section>
<section class="story section" id="our-story">
 <div class="story-image"><img src="/assets/TB-12-detail.png" alt="TreeBites Nolen Gur date palm jaggery with a spoon and serving bowl" loading="lazy" width="900" height="900"><span class="story-stamp">A LITTLE<br><strong>taste of<br>Bengal.</strong></span><span class="story-caption">NOLEN GUR · DATE PALM JAGGERY</span></div>
 <div class="story-copy"><span class="eyebrow">FAMILIAR ROOTS. FRESH ROUTINES.</span><h2>Some things<br>just taste<br><span class="accent-text">like home.</span></h2><p>Meet the brand behind the familiar flavours. Discover TreeBites, our collection and the everyday moments our products fit into.</p><a class="button" href="/our-story/">Read our story</a></div>
</section>
<section class="shopping-note"><div><span class="eyebrow">YOUR FAVOURITES. YOUR WAY.</span><h2>Find it here.<br><span>Make it yours.</span></h2><p>Explore TreeBites, then order the exact product<br>through your preferred retailer.</p></div><div class="shopping-action"><div class="retailer-names"><span>amazon</span><span class="retailer-divider"></span><span>FASHINOWORLD</span></div><a class="button light" href="/products/">Explore the collection</a><span>Price & delivery on your retailer’s website.</span></div></section>
${faq}`;
}
