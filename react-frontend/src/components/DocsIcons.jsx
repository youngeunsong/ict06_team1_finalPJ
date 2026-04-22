import React from 'react'

import IconsImg from 'src/assets/images/icons.webp'

const DocsIcons = () => (
  <div className="bg-warning bg-opacity-10 border border-2 border-warning rounded mb-4">
    <div className="row d-flex align-items-center p-3 px-xl-4 flex-xl-nowrap">
      <div className="col-xl-auto col-12 d-none d-xl-block p-0">
        <img className="img-fluid" src={IconsImg} width="160px" height="160px" alt="CoreUI Icons" />
      </div>
      <div className="col-md-auto col-12 mt-3 mt-lg-0">
        <a
          className="btn btn-warning text-nowrap text-white"
          href="https://coreui.io/react/docs/components/icon/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore Documentation
        </a>
      </div>
    </div>
  </div>
)

export default DocsIcons
