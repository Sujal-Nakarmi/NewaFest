

import "../CSS/BhintunaCelebration.css"

function BhintunaCelebration() {
  const expectations = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
  ]

  const celebrationMethods = [
    {
      title:
        "Processions through the city: Participants, often in traditional attire, walk through key streets in cities like Kathmandu and Bhaktapur, starting from Basantapur Durbar Square.",
      images: [
        "https://v0.dev/placeholder.svg?height=200&width=300",
        "https://v0.dev/placeholder.svg?height=200&width=300",
        "https://v0.dev/placeholder.svg?height=200&width=300",
      ],
    },
    {
      title:
        "Traditional music and dance: People play Newari drums (Dha) and other instruments, accompanied by cultural dances.",
      images: [
        "https://v0.dev/placeholder.svg?height=200&width=300",
        "https://v0.dev/placeholder.svg?height=200&width=300",
        "https://v0.dev/placeholder.svg?height=200&width=300",
      ],
    },
    {
      title:
        'Offerings and greetings: People stop at temples to offer prayers and exchange "Bhintuna" greetings for good fortune in the new year.',
      images: [
        "https://v0.dev/placeholder.svg?height=200&width=300",
        "https://v0.dev/placeholder.svg?height=200&width=300",
        "https://v0.dev/placeholder.svg?height=200&width=300",
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

      {/* Bhintuna Section */}
      <section className="text-center mb-5">
        <h1 className="bhintuna-title">Bhintuna</h1>
        <p className="bhintuna-description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
        </p>
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <img
              src="https://v0.dev/placeholder.svg?height=200&width=300"
              alt="Cultural event 1"
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-4">
            <img
              src="https://v0.dev/placeholder.svg?height=200&width=300"
              alt="Cultural event 2"
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-4">
            <img
              src="https://v0.dev/placeholder.svg?height=200&width=300"
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

