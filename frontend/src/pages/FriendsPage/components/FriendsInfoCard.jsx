import { useTranslation } from '../../../contexts/LanguageContext';

export function FriendsInfoCard()
{
	const { t } = useTranslation();

	return (
		<article className="card intro-card">
			<p className="section-kicker">
				{t('friends.info.kicker')}
			</p>
			<h2 className="intro-title">
				{t('friends.info.title')}
			</h2>
			<p>
				{t('friends.info.description')}
			</p>

			<div className="info-note">
				<span>
					{t('friends.info.note_title')}
				</span>

				<p>
					{t('friends.info.note_desc')}
				</p>
			</div>
		</article>
	);
}
