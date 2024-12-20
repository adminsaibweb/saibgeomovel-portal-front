import React, { Component } from 'react';
import { Container, ContentPhotos, LinePhoto } from './styled';
// import noSearchImage from '../../../../../assets/images/noimagequadrada.jpg';
import { getFromStorage } from '../../../../../services/auth';
import Photo from './Photo';
import Skeleton from 'react-loading-skeleton';
import { capitalize } from '../../../../../services/funcoes';

export default class PhotosList extends Component {
  state = {
    openImage: false,
    userName: '',
    loading: false,
    positionImageInListImages: -1,
  };

  async componentDidMount() {
    await this.carregarVariaveisEstado();
  }

  componentDidUpdate(prevProps) {
    const { openImage } = this.state;

    if (this.state.openImage) {
      document.addEventListener('keydown', this.eventKeyEsc);
    }
    if (this.props.forceLoading !== prevProps.forceLoading) {
      !openImage &&
        this.setState({
          loading: this.props.forceLoading,
        });
    }
  }

  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  eventKeyEsc = (e) => {
    if (!this.state.openImage) {
      document.removeEventListener('keydown', this.eventKeyEsc);
    }
    if (e.key === 'Escape') {
      this.handleClosePhoto();
    }
  };

  handleClosePhoto = () => {
    this.setState({
      openImage: false,
      pathImage: '',
    });
    // document.removeEventListener('keydown', arguments.callee,false);
  };

  handleNavigatePhoto = (direction, images) => {
    const { positionImageInListImages } = this.state;
    let imageToRender;

    if (direction === 'before') {
      imageToRender = images.find((item, i) => i === positionImageInListImages - 1);
    } else {
      imageToRender = images.find((item, i) => i === positionImageInListImages + 1);
    }

    this.setState({
      descriptionPhoto: imageToRender.DESCRICAO,
      pathImage: imageToRender.GPC_RESPOSTA_IMAGEM_URL,
      positionImageInListImages: direction === 'after' ? positionImageInListImages + 1 : positionImageInListImages - 1,
    });
  };

  render() {
    const { loading, openImage, pathImage, positionImageInListImages, descriptionPhoto } = this.state;
    const { heightFixed, withBoxShadow, photosList, userName, withNavigation } = this.props;

    return (
      <Container heightFixed={heightFixed} withBoxShadow={withBoxShadow}>
        {loading ? (
          <div className="skeletonLoading">
            <Skeleton height={50} />
            <Skeleton height={10} />
            <Skeleton height={50} count={3} />
          </div>
        ) : (
          <>
            {userName && (
              <div className="titleList">{userName ? <h5>Fotos - {`${userName}`}</h5> : <h5>Fotos </h5>}</div>
            )}

            <ContentPhotos>
              {photosList.length > 0 ? (
                photosList.map((photo, i) => (
                  <LinePhoto key={i}>
                    <p>{photo.DESCRICAO && capitalize(photo.DESCRICAO, true)}</p>

                    <img
                      src={photo.GPC_RESPOSTA_IMAGEM_URL}
                      alt="Foto"
                      onClick={() =>
                        this.setState({
                          openImage: true,
                          descriptionPhoto: photo.DESCRICAO,
                          pathImage: photo.GPC_RESPOSTA_IMAGEM_URL,
                          positionImageInListImages: i,
                        })
                      }
                    />
                  </LinePhoto>
                ))
              ) : userName ? (
                <p>Nenhuma foto enviada.</p>
              ) : (
                ''
              )}
            </ContentPhotos>

            {openImage && (
              <Photo
                pathImage={pathImage}
                withNavigation={withNavigation}
                closePhoto={this.handleClosePhoto}
                descriptionPhoto={descriptionPhoto}
                handleNavigatePhoto={(direction) => this.handleNavigatePhoto(direction, photosList)}
                disableNavigateBefore={positionImageInListImages === 0}
                disableNavigateAfter={positionImageInListImages === photosList?.length - 1}
              />
            )}
          </>
        )}
      </Container>
    );
  }
}
