
const WA_NUMBER = "919354927609";

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  const header = document.querySelector("header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  document.querySelectorAll(".reveal").forEach(el => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){ entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, {threshold:.12});
    io.observe(el);
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if(toggle && nav){
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", isOpen);
    });

    // Close the menu after selecting a navigation item.
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
      });
    });
  }

  document.querySelectorAll(".faq button").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq");
      const answer = item.querySelector(".faq-answer");
      document.querySelectorAll(".faq.open").forEach(other => {
        if(other !== item){
          other.classList.remove("open");
          other.querySelector(".faq-answer").style.height = "0px";
        }
      });
      item.classList.toggle("open");
      answer.style.height = item.classList.contains("open") ? answer.scrollHeight + "px" : "0px";
    });
  });

  const params = new URLSearchParams(location.search);
  const product = params.get("product");
  const productField = document.querySelector("#product");
  if(product && productField) productField.value = product;

  const form = document.querySelector("#quoteForm");
  if(form){
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = new FormData(form);
      const message =
`Hello COCOON,

I would like to enquire about your collection.

Name: ${data.get("name") || ""}
Business: ${data.get("business") || ""}
Product / Category: ${data.get("product") || ""}
Quantity: ${data.get("quantity") || ""}
Email: ${data.get("email") || ""}

Message:
${data.get("message") || ""}`;

      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    });
  }

  document.querySelectorAll("[data-whatsapp]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const productName = link.getAttribute("data-whatsapp") || "COCOON Collection";
      const msg = `Hello COCOON, I would like to enquire about ${productName}.`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  });
});
