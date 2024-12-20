import styled from 'styled-components';

export const Content = styled.div`
  width: 100%;
  max-height: 100%;
  /* max-width: ${(props) => (props.maxWidth ? 'unset' : '17rem')}; */
  div.skeletonLoading {
    width: 20rem;
  }
`;
export const ContentCardDetailsTrade = styled.div`
  display: flex;
  max-height: 100%;
  justify-content: space-around;
  padding: 5px 10px;

  height: 5rem;

  background: #8e44ad;
  border-radius: 10px;
`;

export const TotalAlerts = styled.div`
  display: flex;

  justify-content: center;

  flex-direction: column;
  color: #fff;
  max-height: 100%;
  font-weight: 500;
  @media (max-width: 320px) {
    font-size: 1.3rem;
  }

  font-size: 1.6rem;

  span {
    text-align: center;
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 1.7rem;
    @media (max-width: 320px) {
      font-size: 1.3rem;
    }
  }
`;

export const Separator = styled.div`
  background: #fff;
  width: 1px;
  margin: 0 7px;
`;

export const ContentDetailsTrade = styled.div`
  display: flex;
  /* justify-content: center; */
  /* width: 20rem; */
  /* flex-direction: column; */
  p {
    font-size: 1.1rem;
  }
  @media (max-width: 320px) {
    p {
      font-size: 0.9rem;
    }
  }
  div.details {
    display: flex;
    align-self: flex-start;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 100%;
    /* width: 12rem; */
    @media (min-height: 769px) {
      /* width: 14rem; */
    }
  }

  div.lineDetail {
    @media (min-height: 769px) {
      min-width: 30%;
      line-height: 17px;
    }
    line-height: 1.4rem;
    height: max-content;
    display: flex;
    margin-right: 10px;

    @media (max-width: 320px) {
      margin-right: 5px;
    }

    span,
    p {
      color: #fff;
    }

    span {
      font-size: 1.1rem;
      font-weight: 500;
      margin-right: 10px;

      @media (max-width: 320px) {
        font-size: 0.9rem;
      }
    }
  }
`;
