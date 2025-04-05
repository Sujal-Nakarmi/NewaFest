import "../CSS/BhintunaCelebration.css"
import Bhintuna1 from "../Assests/Bhintuna1.png";
import Bhintuna2 from "../Assests/Bhintuna2.png";
import Bhintuna3 from "../Assests/Bhintuna3.png";
import BC1 from "../Assests/BC1.png";
import BC2 from "../Assests/BC2.png";
import BC3 from "../Assests/BC3.png";
import BC4 from "../Assests/BC4.png";
import BC5 from "../Assests/bc5.png";
import BC6 from "../Assests/bc6.png";
import BC7 from "../Assests/BC7.png";
import BC8 from "../Assests/BC8.png";
import BC9 from "../Assests/BC9.png";
import BC10 from "../Assests/BC10.png";

function BhintunaCelebration() {
  const expectations = [
    "Volunteers are expected to embrace and uphold the values of Newari culture by showing respect during rituals, processions, and cultural activities.",
    "Support in organizing and managing various segments of Bhintuna, including rallies, performances, and cultural showcases, ensuring smooth flow and participation.",
    "Maintain cleanliness around the event area and help enforce discipline among attendees, encouraging a respectful and festive environment.",
    "Help visitors understand the significance of Bhintuna, guide them through the activities, and provide assistance when needed with warmth and hospitality.",
  ]

  const celebrationMethods = [
    {
      title:
        "Processions through the city: Participants, often in traditional attire, walk through key streets in cities like Kathmandu and Bhaktapur, starting from Basantapur Durbar Square.",
      images: [
        BC1,
        BC2,
        BC7,
      ],
    },
    {
      title:
        "Traditional music and dance: People play Newari drums (Dha) and other instruments, accompanied by cultural dances.",
      images: [
       BC3,
        BC10,
        BC8,
      ],
    },
    {
      title:
        'Offerings and greetings: People stop at temples to offer prayers and exchange "Bhintuna" greetings for good fortune in the new year.',
      images: [
        BC5,
       BC6,
       BC9,
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
        <h1 className="bhintuna-title">Bhintuna</h1>
        <p className="bhintuna-description">
        Bhintuna is a significant Newari cultural event celebrated in the Kathmandu Valley, marking the arrival of the New Year according to the Nepal Sambat calendar. 
        This vibrant festival brings together the Newar community to celebrate with a rich blend of tradition, music, dance, and rituals. The day is marked by processions through 
        the streets, where participants, often dressed in traditional attire, visit key places like Basantapur Durbar Square in Kathmandu, Bhaktapur, and other historical locations. 
        
        </p>
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <img
              src= {Bhintuna1}
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

export default BhintunaCelebration

