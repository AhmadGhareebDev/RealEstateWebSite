import landingPageImg from './assets/landingPageImg.jpg';
import ServiceCard from './components/ServiceCard';
import Buyimg from './assets/undraw_coming-home_jmbc.svg'
import Rentimg from './assets/undraw_sweet-home_ezw3.svg'
import Financeimg from './assets/undraw_wallet_diag.svg'
import TrendingHomes from './components/TrendingHomes';

export default function Landing() {

  const ServiceCards = [
    {
      imgSrc: Buyimg,
      title: "Buy a home",
      description: "A real estate agent can provide you with a clear breakdown of costs so that you can avoid surprise expenses.",
      buttonText: "Find a local agent",
      onClick: () => alert("Find agent clicked")
    },
    {
      imgSrc: Financeimg,
      title: "Finance a home",
      description: "Zillow Home Loans can get you pre-approved so you're ready to make an offer quickly when you find the right home.",
      buttonText: "Start now",
      onClick: () => alert("Finance clicked")
    },
    {
      imgSrc: Rentimg,
      title: "Rent a home",
      description: "We're creating a seamless online experience – from shopping on the largest rental network, to applying, to paying rent.",
      buttonText: "Find rentals",
      onClick: () => alert("Rent clicked")
    }
  ];

  
  return (
    <div className="w-full">
      <section
        className="relative bg-cover bg-center h-[50vh] w-full flex items-center overflow-hidden"
        style={{ backgroundImage: `url(${landingPageImg})` }}
      >
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            
            <div className="w-full md:w-auto md:flex-1 md:max-w-md order-2 md:order-1">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center md:text-left">
                <p className="text-white font-medium">Search coming soon...</p>
              </div>
            </div>

            <div className="text-center md:text-right text-white order-1 md:order-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Rent.Buy.
                <br className="hidden sm:block" />
                <span className="sm:inline"> </span>
                Sell.Easy.
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <TrendingHomes />
      </section>

      <section className="h-full py-10 px-3 flex items-center justify-center bg-gray-50">
        <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 sm:p-0 p-3'>
          {ServiceCards.map(card => (
            <ServiceCard imgSrc={card.imgSrc} title={card.title} description={card.description} buttonText={card.buttonText} />
          ))}
        </div>
      </section>
    </div>
  );
}