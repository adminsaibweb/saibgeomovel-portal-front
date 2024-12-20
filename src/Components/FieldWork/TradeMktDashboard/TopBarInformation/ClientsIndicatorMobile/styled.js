import styled from 'styled-components';

export const Content = styled.div`
  max-height: 100%;
  width: 100%;

  div.skeletonLoading {
    width: 15rem;
  }
`;
export const ContentCardClients = styled.div`
  display: flex;
  justify-content: space-around;

  max-height: 100%;
  height: 5rem;

  padding: 10px;
  background: #8e44ad;
  border-radius: 10px;

  div {
    /* line-height: 18px; */
    display: flex;
    margin-right: 10px;
    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 500;
      margin-right: 10px;
    }
  }
`;

export const TotalAlertsClients = styled.div`
  display: flex;
  justify-content: center;

  flex-direction: column;
  color: #fff;
  max-height: 100%;
  margin: 0 !important;

  p {
    font-weight: 500;
    font-size: 1.6rem;
    /* line-height: 1.7rem; */

    @media (max-width: 325px) {
      font-size: 1.3rem;
      /* line-height: 1.4rem; */
    }
  }

  span {
    text-align: center;
    font-size: 1.6rem;
    line-height: 1.7rem;

    @media (max-width: 325px) {
      font-size: 1.3rem;
      line-height: 1.4rem;
    }
  }
`;

export const Separator = styled.div`
  background: #fff;
  width: 1px;
  margin: 0 7px;
`;

export const ContentDetailsClients = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;

  p {
    font-size: 1.1rem;
    @media (max-width: 325px) {
      font-size: 1rem;
    }
  }

  div.details {
    display: flex;
    flex-direction: column;
  }

  div.lineDetail {
    line-height: 18px;
    display: flex;
    margin-right: 10px;
    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 500;
      margin-right: 10px;

      font-size: 1.1rem;
      @media (max-width: 325px) {
        font-size: 1rem;
      }
    }
  }
`;
