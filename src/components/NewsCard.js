import React, { Component } from 'react';

import './styles/NewsCardStyles.css';

import unpinned from '../icons/pin_co.svg';
import pinned from '../icons/pin_cf.svg';
import noImage from '../images/noImage.svg'

export default class NewsCard extends Component {



    render() {
        return (
            <article className="card">
                <div className="card-img">
                    <img onError={(e) => { e.target.src = noImage }} src={this.props.urlToImage ? this.props.urlToImage : noImage} alt="" />
                </div>
                <a href={this.props.url} className="card-body" target="_blank">
                    <h3 className="card-title">{this.props.title}</h3>
                    <p className="card-description">{this.props.description ? this.props.description : ''}</p>
                    <div className="card-footer">
                        <div className="card-source"><span className="">Source: </span>{this.props.source.name}</div>
                        <div className="card-date"><span className="">Date: </span>{new Date(this.props.publishedAt).toLocaleDateString("en-US")}</div>
                    </div>
                </a>

                {/* pin card */}
                <button className="card-pin">
                    <img src={this.props.pinned ? pinned : unpinned} alt="" />
                </button>
            </article>
        )
    }

}