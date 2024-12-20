import React, { Component } from 'react';
import { Container, Content, LayerClosed } from './styledSlide';
import { Button } from 'react-materialize';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { Labels } from './styled';

export default class SlidePhotos extends Component {
  state = {
    currentPhoto: null,
    photosRender: [],
  };

  componentDidMount = async () => {
    let { photosRender } = this.state;
    const { photos } = this.props;

    photos.forEach((pht) => {
      pht.ITENS.forEach((item) => {
        if (item.IMAGES && item.IMAGES.length > 0) {
          const arrayPhotos = item.IMAGES.map((itemImg, index) => {
            return {
              alt: `${pht.name} - ${item.name}`,
              index: photosRender.length + index,
              ...itemImg
            };
          });
          photosRender = [...photosRender, ...arrayPhotos]
        }
      });
    });

    this.setState({ photosRender })
  };

  handleNavigateSlide = (type) => {
    let { currentPhoto, photosRender } = this.state
    const { actualPhoto } = this.props

    if (!currentPhoto) {
      currentPhoto = actualPhoto
    }

    if (type) {
      const element = photosRender.find(e => e.index === currentPhoto?.index)
      if (element.index !== photosRender.length - 1) {
        currentPhoto = photosRender[element.index + 1]
      }
    } else {
      const element = photosRender.find(e => e.index === currentPhoto?.index)
      if (element.index !== 0) {
        currentPhoto = photosRender[element.index - 1]
      }
    }

    this.setState({ currentPhoto })
  };

  render() {
    const { currentPhoto, photosRender } = this.state;
    const { closed, actualPhoto } = this.props;

    return (
      <Container>
        <LayerClosed onClick={closed} />
        <Content>
          <div className="currentPhoto">
            <Button
              onClick={() => this.handleNavigateSlide(0)}
              className="saib-button is-primary"
              style={{ height: '32px', margin: '0.8rem 0 0 0' }}
              disabled={currentPhoto ? currentPhoto?.index === 0 : actualPhoto?.index === 0 ? true : false}
            >
              <IoIosArrowBack size={24} />
            </Button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {currentPhoto && <img className="currentImgSlide" src={currentPhoto.img} alt={'Foto'} />}
              {!currentPhoto && <img className="currentImgSlide" src={actualPhoto.img} alt={'Foto'} />}

              <Labels
                color="#fff"
                fontSize={'1.2rem'}
                fontWeight="500"
                style={{ background: '#8e44ad', padding: '0.2rem', color: '#fff', marginTop: '0.2rem' }}
              >
                {currentPhoto ? currentPhoto?.alt : actualPhoto?.alt}
              </Labels>
            </div>

            <Button
              onClick={() => this.handleNavigateSlide(1)}
              className="saib-button is-primary"
              style={{ height: '32px', margin: '0.8rem 0 0 0' }}
              disabled={currentPhoto?.index === photosRender?.length - 1}
            >
              <IoIosArrowForward size={24} />
            </Button>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '3px', alignItems: 'center', justifyContent: "center", width: '90%' }}>
            {photosRender.map((itemImg) => (
              <div
                key={itemImg.img}
                style={{
                  border: currentPhoto && currentPhoto.img === itemImg.img ? '1px solid #8e44ad' : 'none',
                }}
                onClick={() =>
                  this.setState({
                    currentPhoto: itemImg,
                  })
                }
              >
                <img src={itemImg.img} alt={itemImg.DATA} style={{ width: '4rem', height: '4rem' }} />
              </div>
            ))}
          </div>
        </Content>
      </Container>
    );
  }
}
