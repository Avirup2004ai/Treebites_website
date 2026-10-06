const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

// Publish only known brand and catalogue details. Add founder/history information
// here once supplied by the brand; never infer it from a retailer's company data.
export function renderStory({ categories, products, site }) {
  const rangeCopy = {
    'seeds-and-mixes': 'Pumpkin, sunflower, chia and flax seeds, alongside Healthy Mix. Explore individual seeds and a blend of pumpkin, sunflower, flax and sesame for breakfast bowls, salads and everyday recipes.',
    'kitchen-staples': 'Bengali nolen gur, pure ghee and raw turmeric. Familiar ingredients for cooking, finishing a meal or bringing a distinctive flavour to a favourite dessert.',
    'juices-and-beverages': 'Explore mosambi and lemon, carrot and apple, watermelon, pineapple, and carrot, beetroot, ginger and lemon combinations, alongside Nolen Gur Coconut Chill.',
    'breakfast-and-drink-mixes': 'Sattu Protein Mix in two pack sizes. Discover the blend, compare the packs and follow the preparation directions on the label.',
    'supplements-and-fibre': 'Moringa Capsules, Shilajit Capsules and Isabgol Psyllium Husk. Each product has its own directions and suitability information; refer to its label before use.'
  };
  return `<article class="story-page">
  <div class="story-container story-breadcrumbs breadcrumbs"><a href="/">Home</a><span aria-hidden="true">/</span><span>Our story</span></div>
  <header class="story-container story-hero">
    <div class="story-hero-copy"><span class="eyebrow">OUR STORY · ABOUT TREEBITES</span><h1>Familiar roots.<br><span>Everyday goodness.</span></h1><p>TreeBites brings everyday ingredients, Bengali flavours and food discoveries together. From a handful of seeds to a spoonful of nolen gur, our collection belongs in the little rituals that make a day your own.</p><a class="button" href="/products/">Discover our products</a></div>
    <figure class="story-hero-image"><img src="/assets/TB-12-detail.png" alt="TreeBites Nolen Gur with a spoon and a bowl of Bengali date palm jaggery" width="900" height="900" fetchpriority="high"><figcaption><span class="eyebrow">A TASTE OF THE FAMILIAR</span><span>Nolen gur. A little sweetness, a lot of character.</span></figcaption></figure>
  </header>
  <div class="story-container"><dl class="story-facts"><div><dt>In our catalogue</dt><dd>${products.length} products</dd></div><div><dt>Ways to explore</dt><dd>${categories.length} categories</dd></div><div><dt>Brand contact</dt><dd>Kolkata, India</dd></div></dl></div>
  <nav class="story-container story-contents" aria-label="On this page"><span class="eyebrow">GET TO KNOW US</span><a href="#the-brand">The brand</a><a href="#familiar-flavours">Our flavours</a><a href="#our-range">Our range</a><a href="#product-information">Product information</a><a href="#where-to-buy">Where to buy</a><a href="#contact">Get in touch</a></nav>

  <section class="story-container story-editorial" id="the-brand" aria-labelledby="brand-heading">
    <div class="story-section-heading"><span class="eyebrow">01 / THE BRAND</span><h2 id="brand-heading">Good food.<br>Everyday moments.</h2></div>
    <div class="story-prose"><p class="story-lead">A breakfast bowl with a little more crunch. A familiar recipe with its finishing spoonful of ghee. A refreshing pause between the things you do.</p><p>That is the world of TreeBites: ingredients and flavours you can make part of your own routine. Our food and nutrition collection spans seeds and seed mixes, kitchen staples, juices and beverages, breakfast and drink mixes, and supplements and fibre.</p><p>Our brand line, <strong>“Nourishing roots. Enriching lives.”</strong>, sits alongside a collection that brings familiar food traditions and everyday choices into the same place. Browse by ingredient, by category or by the product you already love.</p></div>
  </section>

  <section class="story-flavours" id="familiar-flavours" aria-labelledby="flavours-heading"><div class="story-container story-editorial">
    <div class="story-section-heading"><span class="eyebrow">02 / FAMILIAR FLAVOURS</span><h2 id="flavours-heading">A little taste<br>of Bengal.</h2></div>
    <div class="story-prose"><p class="story-lead">Some flavours feel instantly familiar. Nolen gur is one of them.</p><p>Our <a href="/products/nolen-gur/">Nolen Gur</a> brings Bengali date palm jaggery to desserts, drinks and favourite recipes. Explore the 250 g jar for your everyday kitchen.</p><p>The same flavour appears in a different format in <a href="/products/nolen-gur-coconut-chill/">Nolen Gur Coconut Chill</a>, where coconut meets nolen gur in a bottled drink. Alongside these Bengali-inspired products, <a href="/products/pure-ghee/">Pure Ghee</a> and <a href="/products/raw-turmeric/">Raw Turmeric</a> make up the rest of our kitchen-staples collection.</p><a class="text-link" href="/categories/kitchen-staples/">Explore the kitchen staples</a></div>
  </div></section>

  <section class="story-container story-range" id="our-range" aria-labelledby="range-heading">
    <div class="story-section-heading"><span class="eyebrow">03 / OUR RANGE</span><h2 id="range-heading">Five ways to find<br>your kind of good.</h2><p>Get to know what is in the TreeBites collection.</p></div>
    <div class="story-range-list">${categories.map((category, index) => `<article><span class="story-range-number" aria-hidden="true">0${index + 1}</span><div><h3><a href="/categories/${category.slug}/">${escape(category.name)}</a></h3><p>${escape(rangeCopy[category.slug])}</p><a class="text-link" href="/categories/${category.slug}/">Explore ${products.filter(product => product.category.slug === category.slug).length} products<span class="sr-only"> in ${escape(category.name)}</span></a></div></article>`).join('')}</div>
  </section>

  <section class="story-container story-editorial" id="product-information" aria-labelledby="information-heading">
    <div class="story-section-heading"><span class="eyebrow">04 / KNOW YOUR PRODUCT</span><h2 id="information-heading">The details<br>matter.</h2></div>
    <div class="story-prose"><p>Every product page on this website brings together the product name, pack size, imagery, an introduction and directions for everyday use. Where a product comes in different packs, you can explore the available options.</p><p>For the complete ingredients, nutrition information, allergens, best-before date and storage instructions, refer to the actual product label and the retailer’s listing. Packaging and availability may change.</p><p>Products in our supplements and fibre collection have their own preparation and usage directions. Always follow the instructions and precautions on the pack.</p><a class="text-link" href="/products/">Find a product and its details</a></div>
  </section>

  <section class="story-buy" id="where-to-buy" aria-labelledby="buy-heading"><div class="story-container story-editorial">
    <div class="story-section-heading"><span class="eyebrow">05 / WHERE TO BUY</span><h2 id="buy-heading">Meet it here.<br>Make it yours.</h2></div>
    <div class="story-prose"><p>Use this website to explore TreeBites and choose your product. On its page, select <strong>Order on Amazon</strong> or <strong>Buy now</strong> to open the linked product or pack at your chosen retailer. Website orders open on Fashinoworld.</p><p>Your retailer shows the current price, stock and delivery options, and handles payment, shipping, order support and returns. Some Amazon buttons remain unavailable while the matching product or pack is being confirmed.</p><a class="button light" href="/products/">Find your favourite</a></div>
  </div></section>

  <section class="story-container story-editorial story-contact" id="contact" aria-labelledby="contact-heading">
    <div class="story-section-heading"><span class="eyebrow">06 / GET IN TOUCH</span><h2 id="contact-heading">Let’s talk<br>TreeBites.</h2></div>
    <div class="story-prose"><p>For brand and product enquiries, contact the TreeBites team by email. Follow our official Instagram profile to stay connected with the brand.</p><address><span>Kolkata, India</span><a href="mailto:${escape(site.email)}">${escape(site.email)}</a><a href="${escape(site.instagram)}" target="_blank" rel="noopener noreferrer">Instagram · @treebites.official<span class="sr-only"> (opens in a new tab)</span></a>${site.facebook ? `<a href="${escape(site.facebook)}" target="_blank" rel="noopener noreferrer">Facebook<span class="sr-only"> (opens in a new tab)</span></a>` : ''}</address><p class="story-contact-note">For an existing order, contact the retailer you purchased from with your order details.</p></div>
  </section>
</article>`;
}
