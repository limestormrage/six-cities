import { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams } from 'react-router';
import Loader from '../../pages/loading-screen/loading-screen';
import CardList from '../../components/card-list/card-list';
import Comments from '../../components/comments/comments';
import Header from '../../components/header/header';
import HostList from '../../components/host-list/host-list';
import ImageList from '../../components/image-list/image-list';
import Map from '../../components/map/map';
import OptionList from '../../components/option-list/option-list';
import { offersType } from '../../const';
import { fetchCommentsAction, fetchOfferAction, fetchOffersNearby } from '../../store/api-actions';
import { ThunkAppDispatch } from '../../types/action';
import { State } from '../../types/state';
import NotFound from '../not-found/not-found-screen';

const MAX_COUNT_NEARBY = 3;

const mapStateToProps = (
  {OFFERS, COMMENTS}: State,
) => ({
  offer: OFFERS.offer,
  offerLoading: OFFERS.offerLoading,
  offerError: OFFERS.offerError,
  offersNearby: OFFERS.offersNearby,
  offersNearbyError: OFFERS.offersNearbyError,
  offersNearbyLoading: OFFERS.offersNearbyLoading,
  comments: COMMENTS.comments,
  commentsLoading: COMMENTS.commentsLoading,
  commentsError: COMMENTS.commentsError,
});

const mapDispatchToProps = (dispatch: ThunkAppDispatch) => ({
  onLoadCard(id: string) {
    dispatch(fetchOfferAction(id));
    dispatch(fetchOffersNearby(id));
    dispatch(fetchCommentsAction(id));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

function Property(
  {offer, offerLoading, offerError, offersNearby, offersNearbyError, offersNearbyLoading,
    commentsLoading, commentsError, onLoadCard}: PropsFromRedux,
): JSX.Element {
  const { id } = useParams<{ id: string}>();

  useEffect(() =>{
    onLoadCard(id);
  }, [id, onLoadCard]);

  if (offerLoading || offersNearbyLoading || commentsLoading || !offersNearby) {
    return <Loader/>;
  }

  if (offerError || offersNearbyError || commentsError || !offer) {
    return <NotFound/>;
  }

  const nearbyList = offersNearby.slice(0, MAX_COUNT_NEARBY);
  const offersPinsForMap = [...nearbyList, offer];

  return (
    <div className="page">
      <Header/>

      <main className="page__main page__main--property">
        <section className="property">
          <ImageList images={offer.images} type={offer.type}/>
          <div className="property__container container">
            <div className="property__wrapper">
              {offer.isPremium && (
                <div className="property__mark">
                  <span>Premium</span>
                </div>
              )}
              <div className="property__name-wrapper">
                <h1 className="property__name">
                  {offer.title}
                </h1>
                <button className={`property__bookmark-button  button ${offer.isFavorite && 'property__bookmark-button--active'}`} type="button">
                  <svg className="property__bookmark-icon" width="31" height="33">
                    <use xlinkHref="#icon-bookmark"></use>
                  </svg>
                  <span className="visually-hidden">To bookmarks</span>
                </button>
              </div>
              <div className="property__rating rating">
                <div className="property__stars rating__stars">
                  <span style={{width: '80%'}}></span>
                  <span className="visually-hidden">Rating</span>
                </div>
                <span className="property__rating-value rating__value">${offer.rating}</span>
              </div>
              <ul className="property__features">
                <li className="property__feature property__feature--entire">
                  {offersType[offer.type]}
                </li>
                <li className="property__feature property__feature--bedrooms">
                  {`${offer.bedrooms} Bedrooms`}
                </li>
                <li className="property__feature property__feature--adults">
                  {`Max ${offer.maxAdults} adults`}
                </li>
              </ul>
              <div className="property__price">
                <b className="property__price-value">&euro;{offer.price}</b>
                <span className="property__price-text">&nbsp;night</span>
              </div>
              <OptionList options={offer.goods}/>
              <HostList host={offer.host} description={offer.description}/>
              <Comments/>
            </div>
          </div>
          <Map
            cards={offersPinsForMap}
            activeCard={offer.id}
            className="property__map"
          />
        </section>
        <div className="container">
          <section className="near-places places">
            <h2 className="near-places__title">Other places in the neighbourhood</h2>
            <CardList
              cards={nearbyList}
              listType="near"
              cardType="near"
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default connector(Property);
