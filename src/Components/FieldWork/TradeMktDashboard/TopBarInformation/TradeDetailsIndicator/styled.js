import styled from 'styled-components';

export const Content = styled.div`
  display: flex;
  max-height: 100%;
  width: 100%;
  div.skeletonLoading {
    width: 20rem;
  }
`;
export const ContentCardDetailsTrade = styled.div`
  display: flex;
  flex-grow: 1;
  max-height: 100%;
  justify-content: center;
  padding: 10px;
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
  font-weight: 700;

  span {
    text-align: center;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
`;

export const Separator = styled.div`
  background: #fff;
  width: 1px;
  margin: 0 10px;
`;

export const ContentDetailsTrade = styled.div`
  display: flex;
  p {
    font-size: 0.7rem;
  }
  div.details {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-self: center;
    width: max-content;
    height: 4rem;
    justify-content: center;
    gap: 2px;
  }

  div.lineDetail {
    @media (min-height: 769px) {
      min-width: 30%;
      line-height: 17px;
    }
    line-height: 15px;
    display: flex;
    margin-right: 5px;
    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 700;
      margin-right: 5px;
    }
  }
`;
