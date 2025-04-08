import "../CSS/BhintunaCelebration.css"
import Bhintuna1 from "../Assests/Bhintuna1.png";
import Bhintuna2 from "../Assests/Bhintuna2.png";
import Bhintuna3 from "../Assests/Bhintuna3.png";
import BC1 from "../Assests/IHC1.png";
import BC2 from "../Assests/IHC2.png";
import BC3 from "../Assests/IHC3.png";
import BC4 from "../Assests/IHC4.png";
import BC5 from "../Assests/IHC5.png";
import BC6 from "../Assests/IHC6.png";
import BC7 from "../Assests/ihc7.jpg";
import BC8 from "../Assests/ihc8.jpg";
import BC9 from "../Assests/ihc9.jpg";
import BC10 from "../Assests/BC10.png";

function IhiCelebration() {

  const celebrationMethods = [
    {
      title:
        "Ceremonial Preparation: Families prepare by dressing the young girls in traditional attire, often including jewelry, and decorating the home.",
      images: [
        BC1,
        BC2,
        BC7,
      ],
    },
    {
      title:
        "Procession to the Temple: The girls, accompanied by family members, are taken to a temple, typically in the morning.",
      images: [
       BC3,
       BC4,
        BC8,
      ],
    },
    {
      title:
        'Bel Fruit Ceremony: At the temple, the girls are symbolically married to the bel fruit, representing Lord Vishnu.',
      images: [
        BC5,
       BC6,
       BC9,
      ],
    },
  ]

  return (
    <div className="container my-5">
      


      {/* Celebration Method Section */}
      <section>
        <h2 className="section-title mb-4">Celebration Method</h2>
        <div className="celebration-methods">
          {celebrationMethods.map((method, index) => (
            <div key={index} className="celebration-item mb-5">
              <div className="d-flex align-items-start mb-4">
                <div className="number-circle">{index + 1}</div>
                <p className="method-description ms-3 mb-0">{method.title}</p>
              </div>
              <div className="row g-4">
                {method.images.map((image, imgIndex) => (
                  <div key={imgIndex} className="col-md-4">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Celebration method ${index + 1}-${imgIndex + 1}`}
                      className="img-fluid rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default IhiCelebration

