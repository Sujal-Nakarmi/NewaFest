import "../CSS/BhintunaCelebration.css"
import GC1 from "../Assests/GC1.png";
import Bhintuna2 from "../Assests/GC2.png";
import Bhintuna3 from "../Assests/GC3.png";
import GJ1 from '../Assests/GJ1.png'
import GJ2 from '../Assests/GJ2.png'
import GJ3 from '../Assests/GJ3.png'
import GJ4 from '../Assests/GJ4.png'
import GJ5 from '../Assests/GJ5.png'
import GJ6 from '../Assests/GJ6.png'
import GJ7 from '../Assests/GJ7.png'
import GJ8 from '../Assests/GJ8.jpg'
import GJ9 from '../Assests/GJ9.jpg'

function GaiJatraCelebration() {
  const expectations = [
    "Assist in organizing and managing the Gai Jatra procession to ensure smooth movement and cultural harmony throughout the event.",
    "Support participants, including performers and community members, by guiding them with schedules, directions, and required resources.",
    "Help maintain cleanliness and safety across event zones, ensuring a respectful and festive environment.",
    "Promote Newa cultural values by engaging with visitors, answering queries, and upholding the spirit of Gai Jatra.",
  ]

  const celebrationMethods = [
    {
      title:
        "Procession of Cows: Families with deceased members lead a cow, symbolizing the journey of souls to the afterlife, through the streets.",
      images: [
        GJ1,
        GJ2,
        GJ7,
      ],
    },
    {
      title:
        "Dressing and Decorations: Participants dress in traditional attire, and homes are decorated with marigold flowers and other festive items.",
      images: [
        GJ3,
        GJ4,
       GJ8,
      ],
    },
    {
      title:
        'Community Gathering: The festival encourages social bonding as neighbors and families gather to share food and stories.',
      images: [
        GJ5,
        GJ6,
       GJ9,
      ],
    },
  ]

  return (
    <div className="container my-5">
      {/* Volunteering Expectations Section */}
      <section className="mb-5">
        <h2 className="section-title mb-4">Volunteering Expectations</h2>
        <div className="numbered-list">
          {expectations.map((expectation, index) => (
            <div key={index} className="numbered-item">
              <span className="number">{index + 1}.</span>
              <p className="content">{expectation}</p>
            </div>
          ))}
        </div>
      </section>
      <br/>
      <br/>

      {/* Bhintuna Section */}
      <section className="text-center mb-5">
        <h1 className="bhintuna-title">Gai Jatra</h1>
        <p className="bhintuna-description">
        Gai Jatra is a Newari festival celebrated to honor and remember deceased loved ones. During the festival, 
        families lead a cow or a person dressed as one in a lively procession, symbolizing the journey of the departed soul. 
        The event is filled with humor, satire, and colorful celebrations, blending mourning with joy.
        </p>
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <img
              src= {GC1}
              alt="Cultural event 1"
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-4">
            <img
              src= {Bhintuna2}
              alt="Cultural event 2"
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-4">
            <img
              src= {Bhintuna3}
              alt="Cultural event 3"
              className="img-fluid rounded"
            />
          </div>
        </div>
      </section>

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

export default GaiJatraCelebration

