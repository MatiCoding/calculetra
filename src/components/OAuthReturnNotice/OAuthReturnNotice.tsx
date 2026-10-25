import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { readOAuthReturn } from '../../auth/oauth/oauthReturn';

// After logging in with a provider the user comes back to "/", with the
// error in the URL if something went wrong. This removes it from the URL (so
// a reload does not show it again) and passes the message to NoticeDialog.
function OAuthReturnNotice() {
    const { search, hash } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const result = readOAuthReturn(search, hash);
        if (result.kind === 'none') return;

        // Cancelling is not an error: clean the URL and show nothing.
        const state = result.kind === 'error' ? { notice: result.message } : null;
        navigate('/', { replace: true, state });
    }, [search, hash, navigate]);

    return null;
}

export default OAuthReturnNotice;