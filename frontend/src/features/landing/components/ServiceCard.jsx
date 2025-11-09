export default function ServiceCard({ imgSrc, title, description, buttonText, onButtonClick }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border-sky-200 border  hover:shadow-xl">
      <div className="mb-6 w-32 h-32 rounded-full bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
        <img 
          src={imgSrc} 
          alt={title} 
          className="w-full h-full object-contain"
        />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-1">
        {description}
      </p>

      <button
        onClick={onButtonClick}
        className="mt-auto px-5 py-2 text-blue-600 border border-blue-600 rounded-full font-medium hover:bg-blue-50 transition"
      >
        {buttonText}
      </button>
    </div>
  );
}